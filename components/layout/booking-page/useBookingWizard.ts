'use client';

import { useMemo, useState } from 'react';

import { useHydrated } from '@/app/store/useHydrated';

import bookingStepKeys from './bookingStepKeys';
import { ANY_MASTER } from './constants';
import { scrollToBookingTop } from './scrollToBookingTop';
import slotFits from './slotFits';
import todayDateKey from './todayDateKey';
import type {
  BookingData,
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
  StepKey,
} from './types';
import type { BookingFiltersState } from './useBookingFilters';
import { useBookingFilters } from './useBookingFilters';
import type { BookingPaymentState } from './useBookingPayment';
import { useBookingPayment } from './useBookingPayment';
import { useBookingPreselect } from './useBookingPreselect';
import type { BookingScheduleState } from './useBookingSchedule';
import { useBookingSchedule } from './useBookingSchedule';
import { useBookingSubmit } from './useBookingSubmit';
import { useReschedulePrefill } from './useReschedulePrefill';
import { useServicesPrefill } from './useServicesPrefill';

/**
 * Everything render needs from the controller hook: the wizard's own state and
 * handlers, plus the narrowed rosters ({@link BookingFiltersState}), the day's
 * slots ({@link BookingScheduleState}) and the payment choice
 * ({@link BookingPaymentState}) the wizard composes.
 */
export interface BookingWizardState
  extends BookingFiltersState, BookingScheduleState, BookingPaymentState {
  /** Chosen flow, `null` on the entry screen */
  flow: BookingFlow | null;
  /** Dynamic step order for the chosen flow */
  stepKeys: StepKey[];
  /** Index of the active step */
  stepIdx: number;
  /** Key of the active step (`undefined` on the entry screen) */
  currentStepKey: StepKey | undefined;
  /** Mobile: the summary screen is shown instead of the step */
  mobileSummary: boolean;
  /** Toggle the mobile summary screen */
  setMobileSummary: (v: boolean) => void;
  /** Active category pill */
  categoryFilter: string;
  /** All salons */
  salons: BookingSalon[];
  /** Chosen salon id */
  salon: string;
  /** Chosen service ids (multi-select, in the order they were picked) */
  selectedServiceIds: string[];
  /** Chosen specialist id (`''`, id or `__any__`) */
  master: string;
  /** Chosen date (ISO day) */
  date: string;
  /** Chosen time slot */
  time: string;
  /** Resolved chosen salon */
  salonObj: BookingSalon | undefined;
  /** Resolved chosen services */
  serviceObjs: BookingService[];
  /** Resolved chosen specialist (`undefined` for "Any specialist") */
  masterObj: BookingMaster | undefined;
  /** "Any specialist" is the current choice */
  masterAny: boolean;
  /** The current step's Continue button is enabled */
  canNext: boolean;
  /** The active step is the last one */
  isLastStep: boolean;
  /** The booking succeeded — show the success modal */
  booked: boolean;
  /** The user is authenticated */
  isAuth: boolean;
  /** The order request is in flight */
  isLoading: boolean;
  /** The order error message (`''` when none) */
  error: string;
  /** Start a flow from the entry screen */
  startFlow: (f: BookingFlow) => void;
  /** Choose a salon */
  selectSalon: (id: string) => void;
  /** Toggle a service in or out of the multi-selection */
  selectService: (id: string) => void;
  /** Choose a specialist */
  selectMaster: (id: string) => void;
  /** Clear every chosen service ("Change") */
  clearService: () => void;
  /** Advance to the next step */
  handleNext: () => void;
  /** Go back a step (or to the entry screen) */
  handleBack: () => void;
  /** Submit the booking */
  handleConfirm: () => void;
  /** Reset the whole flow back to the entry screen */
  resetFlow: () => void;
  /** Close the success modal and reset the flow */
  handleCloseSuccess: () => void;
  /** Jump to a step from the step bar */
  goStep: (idx: number) => void;
  /** Activate a category pill */
  onCategoryChange: (cat: string) => void;
  /** Pick a date */
  onDate: (d: string) => void;
  /** Pick a time slot */
  onTime: (t: string) => void;
}

/**
 * useBookingWizard — the controller of all wizard state, the dynamic step order
 * and every handler. The pieces that derive from that state live in their own
 * hooks — {@link useBookingFilters} (cross-filters between studio / service /
 * specialist), {@link useBookingSchedule} (the day's slots and their limits),
 * {@link useBookingPayment} (payment account) and {@link useBookingPreselect}
 * (cart / reschedule preselection) — and are composed back into one state
 * object, so the component stays a thin render.
 * @param   {BookingData}        data - Salons, services and specialists from the CMS
 * @returns {BookingWizardState}      Wizard state and handlers
 */
export const useBookingWizard = (data: BookingData): BookingWizardState => {
  const { salons, services, masters } = data;

  const [flow, setFlow] = useState<BookingFlow | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [salon, setSalon] = useState('');
  /** Ids of the chosen services — one appointment can bundle several */
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [master, setMaster] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  /** True when the service was preselected upstream — hide the Service step */
  const [serviceLocked, setServiceLocked] = useState(false);
  /** Jump to the Date & Time step once the step list settles (repeat flow) */
  const [pendingDateTime, setPendingDateTime] = useState(false);
  /** The user's own interaction wins over a late cart rehydration */
  const [touched, setTouched] = useState(false);

  const payment = useBookingPayment();

  /**
   * `?reschedule={orderId}` — the wizard is moving an existing appointment, so
   * it preselects from that order and confirms into an UPDATE of it.
   */
  const reschedule = useReschedulePrefill();

  /** `?services=233,240` — the services an offer bundles, preselected as a set */
  const queryProductIds = useServicesPrefill();

  const { submit, booked, closeSuccess, isAuth, isLoading, error } =
    useBookingSubmit({
      paymentAccount: payment.paymentAccount,
      rescheduleOrderId: reschedule.orderId,
    });

  useBookingPreselect({
    data,
    reschedule,
    queryProductIds,
    touched,
    setters: {
      setFlow,
      setMaster,
      setServiceIds,
      setSalon,
      setCategoryFilter,
      setStepIdx,
      setServiceLocked,
      setPendingDateTime,
    },
  });

  /** ── Derived entities ────────────────────────────────────────────────── */
  const salonObj = useMemo(
    () => salons.find((s) => s.id === salon),
    [salons, salon],
  );
  /** Resolve the picked ids to services, preserving the pick order */
  const serviceObjs = useMemo(
    () =>
      serviceIds
        .map((id) => services.find((s) => s.id === id))
        .filter((s): s is BookingService => Boolean(s)),
    [services, serviceIds],
  );
  const masterObj = useMemo(
    () =>
      master === ANY_MASTER ? undefined : masters.find((m) => m.id === master),
    [masters, master],
  );

  const filters = useBookingFilters({
    data,
    flow,
    salon,
    serviceIds,
    master,
    categoryFilter,
  });
  const schedule = useBookingSchedule({
    masterObj,
    salonObj,
    serviceObjs,
    date,
  });

  /**
   * Drop a time that stopped fitting — the services can be changed after the
   * slot was picked (step bar, "Change"), and a longer visit must not silently
   * keep a start that now runs past closing. Adjusted while rendering (React's
   * "derive state during render" pattern), so the step never paints a selected
   * slot that its own grid shows as disabled.
   */
  if (
    time &&
    !slotFits(time, schedule.durationMinutes, schedule.closeMinutes)
  ) {
    setTime('');
  }

  const stepKeys = useMemo<StepKey[]>(
    () => bookingStepKeys({ flow, serviceLocked, master, masters, salons }),
    [flow, serviceLocked, master, masters, salons],
  );
  const currentStepKey = stepKeys[stepIdx];

  /** Once the step list reflects the preselected master, jump to Date & Time */
  if (pendingDateTime && stepKeys.length > 0) {
    setPendingDateTime(false);
    setStepIdx(stepKeys.length - 1);
  }

  /**
   * Land on Date & Time with today already picked, so the step opens on a grid
   * of times instead of a bare calendar. Gated on {@link useHydrated}: "today"
   * is the browser's day and the server cannot know it, so picking it during
   * the hydration render would make the tree differ from the server HTML.
   */
  const hydrated = useHydrated();
  if (hydrated && currentStepKey === 'datetime' && !date) {
    setDate(todayDateKey());
  }

  const stepDone: Record<StepKey, boolean> = {
    salon: Boolean(salon),
    service: serviceIds.length > 0,
    specialist: Boolean(master),
    datetime: Boolean(date) && Boolean(time),
  };
  const canNext = currentStepKey ? stepDone[currentStepKey] : false;
  const isLastStep = stepIdx === stepKeys.length - 1;

  /**
   * Mobile only: after the last step the summary is a separate screen behind
   * a Continue button; desktop keeps it permanently in the right column.
   */
  const [mobileSummary, setMobileSummary] = useState(false);
  if (mobileSummary && !isLastStep) {
    setMobileSummary(false);
  }

  /** ── Handlers (mock `BookingPage` handlers) ──────────────────────────── */

  /**
   * Advance to the next step, unless already on the last one. Steps differ in
   * height, so the block's top is brought back into view with the new step.
   */
  const handleNext = () => {
    if (!isLastStep) setStepIdx((s) => s + 1);
    scrollToBookingTop();
  };
  /** Step back; from the first step this exits the flow to the entry screen. */
  const handleBack = () => {
    setTouched(true);
    if (stepIdx > 0) setStepIdx((s) => s - 1);
    else setFlow(null);
    scrollToBookingTop();
  };
  /** Clear every selection and return to the flow-choice entry screen. */
  const resetFlow = () => {
    setTouched(true);
    setFlow(null);
    setStepIdx(0);
    setSalon('');
    setServiceIds([]);
    setMaster('');
    setDate('');
    setTime('');
    setCategoryFilter('All');
    setServiceLocked(false);
  };
  /**
   * Enter a booking flow from the entry screen, resetting step/category state.
   * @param {BookingFlow} f - The chosen flow (`salon-first` / `specialist-first`)
   */
  const startFlow = (f: BookingFlow) => {
    setTouched(true);
    setFlow(f);
    setStepIdx(0);
    setCategoryFilter('All');
    setServiceLocked(false);
  };

  /**
   * Pick a studio; invalidates a chosen specialist who doesn't work there.
   * @param {string} id - Salon id
   */
  const selectSalon = (id: string) => {
    setTouched(true);
    setSalon(id);
    /** Invalidate a chosen master who doesn't work at this studio */
    if (master && master !== ANY_MASTER) {
      const m = masters.find((x) => x.id === master);
      if (m && m.salonIds.length > 0 && !m.salonIds.includes(id)) setMaster('');
    }
  };
  /**
   * Toggle a service in or out of the multi-selection; syncs the category tab
   * (a single category → that pill, a mixed pick → "All") and invalidates a
   * chosen specialist who performs NONE of the remaining picks.
   * @param {string} id - Service id
   */
  const selectService = (id: string) => {
    setTouched(true);
    const next = serviceIds.includes(id)
      ? serviceIds.filter((x) => x !== id)
      : [...serviceIds, id];
    setServiceIds(next);
    /**
     * Sync the category tab so the specialist step lands narrowed: a single
     * shared category selects that pill, a mix (or an empty pick) falls to All.
     */
    const cats = [
      ...new Set(
        next
          .map((sid) => services.find((x) => x.id === sid)?.category)
          .filter((c): c is string => Boolean(c)),
      ),
    ];
    setCategoryFilter(cats.length === 1 ? (cats[0] ?? 'All') : 'All');
    /** Invalidate a chosen master who performs none of the remaining picks */
    if (master && master !== ANY_MASTER && next.length > 0) {
      const m = masters.find((x) => x.id === master);
      if (
        m &&
        m.serviceIds.length > 0 &&
        !next.some((sid) => m.serviceIds.includes(sid))
      ) {
        setMaster('');
      }
    }
  };
  /** Clear every chosen service and unlock the (preselected) service step. */
  const clearService = () => {
    setTouched(true);
    setServiceIds([]);
    setServiceLocked(false);
    setCategoryFilter('All');
  };
  /**
   * Pick a specialist; auto-picks their single studio and invalidates a studio
   * the specialist cannot cover. The picked services are left untouched — a
   * specialist qualifies by performing at least one of them, and the order
   * still bundles every picked service.
   * @param {string} id - Specialist id (or the "any specialist" sentinel)
   */
  const selectMaster = (id: string) => {
    setTouched(true);
    setMaster(id);
    if (id && id !== ANY_MASTER) {
      const m = masters.find((x) => x.id === id);
      /** Invalidate a chosen studio the specialist doesn't work at */
      if (salon && m && m.salonIds.length > 0 && !m.salonIds.includes(salon)) {
        setSalon('');
      }
      /** Auto-pick a single studio — skips the Salon step entirely */
      if (m?.salonIds.length === 1) setSalon(m.salonIds[0] ?? '');
    }
  };

  /** Submit the assembled selection to the booking/checkout flow. */
  const handleConfirm = () => {
    void submit({
      salon: salonObj,
      services: serviceObjs,
      master: masterObj,
      date,
      time,
    });
  };
  /** Close the success modal and reset the wizard for a new booking. */
  const handleCloseSuccess = () => {
    closeSuccess();
    resetFlow();
  };
  /**
   * Jump directly to a step by index (step-bar navigation).
   * @param {number} idx - Target step index
   */
  const goStep = (idx: number) => {
    setTouched(true);
    setStepIdx(idx);
  };
  /**
   * Change the active service category tab.
   * @param {string} cat - Category label (or `All`)
   */
  const onCategoryChange = (cat: string) => {
    setTouched(true);
    setCategoryFilter(cat);
  };
  /**
   * Pick an appointment day; clears the time (slots differ per day).
   * @param {string} d - Date key `year-monthIndex-day`
   */
  const onDate = (d: string) => {
    setTouched(true);
    setDate(d);
    /** A new day has its own slots — drop a time that may not exist on it */
    setTime('');
  };
  /**
   * Pick an appointment time slot.
   * @param {string} t - Time slot `HH:MM`
   */
  const onTime = (t: string) => {
    setTouched(true);
    setTime(t);
  };

  return {
    ...filters,
    ...schedule,
    ...payment,
    flow,
    stepKeys,
    stepIdx,
    currentStepKey,
    mobileSummary,
    setMobileSummary,
    categoryFilter,
    salons,
    salon,
    selectedServiceIds: serviceIds,
    master,
    date,
    time,
    salonObj,
    serviceObjs,
    masterObj,
    masterAny: master === ANY_MASTER,
    canNext,
    isLastStep,
    booked,
    isAuth,
    isLoading,
    error,
    startFlow,
    selectSalon,
    selectService,
    selectMaster,
    clearService,
    handleNext,
    handleBack,
    handleConfirm,
    resetFlow,
    handleCloseSuccess,
    goStep,
    onCategoryChange,
    onDate,
    onTime,
  };
};
