'use client';

import { useMemo, useReducer, useState } from 'react';

import { useHydrated } from '@/app/store/useHydrated';

import {
  initialBookingState,
  makeBookingReducer,
} from './bookingReducer';
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
  salon: number | null;
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
  selectSalon: (id: number) => void;
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

  /**
   * All wizard state in one reducer (was 12 `useState` cells). The reducer is
   * curried over `data` because its transitions and step order depend on the
   * rosters; `data` is server-provided and stable, so the memo rarely rebuilds.
   */
  const reducer = useMemo(() => makeBookingReducer(data), [data]);
  const [state, dispatch] = useReducer(reducer, initialBookingState);
  const {
    flow,
    stepIdx,
    salon,
    serviceIds,
    master,
    date,
    time,
    categoryFilter,
    serviceLocked,
    touched,
  } = state;

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
    preselect: (preset) => dispatch({ type: 'PRESELECT', preset }),
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
    dispatch({ type: 'DROP_TIME' });
  }

  const stepKeys = useMemo<StepKey[]>(
    () => bookingStepKeys({ flow, serviceLocked, master, masters, salons }),
    [flow, serviceLocked, master, masters, salons],
  );
  const currentStepKey = stepKeys[stepIdx];

  /**
   * Land on Date & Time with today already picked, so the step opens on a grid
   * of times instead of a bare calendar. Gated on {@link useHydrated}: "today"
   * is the browser's day and the server cannot know it, so picking it during
   * the hydration render would make the tree differ from the server HTML.
   */
  const hydrated = useHydrated();
  if (hydrated && currentStepKey === 'datetime' && !date) {
    dispatch({ type: 'SET_DATE_TODAY', date: todayDateKey() });
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

  /** ── Handlers ────────────────────────────────────────────────────────── */
  /**
   * Handlers are thin: each dispatches one action (the transition logic lives in
   * the reducer) and adds any DOM side effect the reducer must not — the scroll
   * back to the block top after a step change, since steps differ in height.
   */

  /** Advance to the next step, unless already on the last one. */
  const handleNext = () => {
    dispatch({ type: 'NEXT' });
    scrollToBookingTop();
  };
  /** Step back; from the first step this exits the flow to the entry screen. */
  const handleBack = () => {
    dispatch({ type: 'BACK' });
    scrollToBookingTop();
  };
  /** Clear every selection and return to the flow-choice entry screen. */
  const resetFlow = () => dispatch({ type: 'RESET' });
  /**
   * Enter a booking flow from the entry screen, resetting step/category state.
   * @param {BookingFlow} f - The chosen flow (`salon-first` / `specialist-first`)
   */
  const startFlow = (f: BookingFlow) => dispatch({ type: 'START_FLOW', flow: f });

  /**
   * Pick a studio; invalidates a chosen specialist who doesn't work there.
   * @param {number} id - Salon id
   */
  const selectSalon = (id: number) => dispatch({ type: 'SELECT_SALON', id });
  /**
   * Toggle a service in or out of the multi-selection; syncs the category tab
   * and invalidates a chosen specialist who performs NONE of the remaining picks.
   * @param {string} id - Service id
   */
  const selectService = (id: string) =>
    dispatch({ type: 'SELECT_SERVICE', id });
  /** Clear every chosen service and unlock the (preselected) service step. */
  const clearService = () => dispatch({ type: 'CLEAR_SERVICE' });
  /**
   * Pick a specialist; auto-picks their single studio and invalidates a studio
   * the specialist cannot cover.
   * @param {string} id - Specialist id (or the "any specialist" sentinel)
   */
  const selectMaster = (id: string) => dispatch({ type: 'SELECT_MASTER', id });

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
    dispatch({ type: 'RESET' });
  };
  /**
   * Jump directly to a step by index (step-bar navigation).
   * @param {number} idx - Target step index
   */
  const goStep = (idx: number) => dispatch({ type: 'GO_STEP', idx });
  /**
   * Change the active service category tab.
   * @param {string} cat - Category label (or `All`)
   */
  const onCategoryChange = (cat: string) =>
    dispatch({ type: 'SET_CATEGORY', category: cat });
  /**
   * Pick an appointment day; clears the time (slots differ per day).
   * @param {string} d - Date key `year-monthIndex-day`
   */
  const onDate = (d: string) => dispatch({ type: 'SET_DATE', date: d });
  /**
   * Pick an appointment time slot.
   * @param {string} t - Time slot `HH:MM`
   */
  const onTime = (t: string) => dispatch({ type: 'SET_TIME', time: t });

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
