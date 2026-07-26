'use client';

import { useMemo, useReducer, useState } from 'react';

import { useHydrated } from '@/app/store/useHydrated';

import { initialBookingState, makeBookingReducer } from '../bookingReducer';
import bookingStepKeys from '../bookingStepKeys';
import { ANY_MASTER } from '../constants';
import type {
  BookingData,
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
  StepKey,
} from '../types';
import { scrollToBookingTop } from '../utils/scrollToBookingTop';
import slotFits from '../utils/slotFits';
import todayDateKey from '../utils/todayDateKey';
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
 * @property {BookingFlow | null}        flow               - Chosen flow, `null` on the entry screen
 * @property {StepKey[]}                 stepKeys           - Dynamic step order for the chosen flow
 * @property {number}                    stepIdx            - Index of the active step
 * @property {StepKey | undefined}       currentStepKey     - Key of the active step (`undefined` on the entry screen)
 * @property {boolean}                   mobileSummary      - Mobile: the summary screen is shown instead of the step
 * @property {(v: boolean) => void}      setMobileSummary   - Toggle the mobile summary screen
 * @property {string}                    categoryFilter     - Active category pill
 * @property {BookingSalon[]}            salons             - All salons
 * @property {number | null}             salon              - Chosen salon id
 * @property {string[]}                  selectedServiceIds - Chosen service ids (multi-select, in the order they were picked)
 * @property {string}                    master             - Chosen specialist id (`''`, id or `__any__`)
 * @property {string}                    date               - Chosen date (ISO day)
 * @property {string}                    time               - Chosen time slot
 * @property {BookingSalon | undefined}  salonObj           - Resolved chosen salon
 * @property {BookingService[]}          serviceObjs        - Resolved chosen services
 * @property {BookingMaster | undefined} masterObj          - Resolved chosen specialist (`undefined` for "Any specialist")
 * @property {boolean}                   masterAny          - "Any specialist" is the current choice
 * @property {boolean}                   canNext            - The current step's Continue button is enabled
 * @property {boolean}                   isLastStep         - The active step is the last one
 * @property {boolean}                   booked             - The booking succeeded — show the success modal
 * @property {boolean}                   isAuth             - The user is authenticated
 * @property {boolean}                   isLoading          - The order request is in flight
 * @property {string}                    error              - The order error message (`''` when none)
 * @property {(f: BookingFlow) => void}  startFlow          - Start a flow from the entry screen
 * @property {(id: number) => void}      selectSalon        - Choose a salon
 * @property {(id: string) => void}      selectService      - Toggle a service in or out of the multi-selection
 * @property {(id: string) => void}      selectMaster       - Choose a specialist
 * @property {() => void}                clearService       - Clear every chosen service ("Change")
 * @property {() => void}                handleNext         - Advance to the next step
 * @property {() => void}                handleBack         - Go back a step (or to the entry screen)
 * @property {() => void}                handleConfirm      - Submit the booking
 * @property {() => void}                resetFlow          - Reset the whole flow back to the entry screen
 * @property {() => void}                handleCloseSuccess - Close the success modal and reset the flow
 * @property {(idx: number) => void}     goStep             - Jump to a step from the step bar
 * @property {(cat: string) => void}     onCategoryChange   - Activate a category pill
 * @property {(d: string) => void}       onDate             - Pick a date
 * @property {(t: string) => void}       onTime             - Pick a time slot
 */
export interface BookingWizardState
  extends BookingFiltersState, BookingScheduleState, BookingPaymentState {
  flow: BookingFlow | null;
  stepKeys: StepKey[];
  stepIdx: number;
  currentStepKey: StepKey | undefined;
  mobileSummary: boolean;
  setMobileSummary: (v: boolean) => void;
  categoryFilter: string;
  salons: BookingSalon[];
  salon: number | null;
  selectedServiceIds: string[];
  master: string;
  date: string;
  time: string;
  salonObj: BookingSalon | undefined;
  serviceObjs: BookingService[];
  masterObj: BookingMaster | undefined;
  masterAny: boolean;
  canNext: boolean;
  isLastStep: boolean;
  booked: boolean;
  isAuth: boolean;
  isLoading: boolean;
  error: string;
  startFlow: (f: BookingFlow) => void;
  selectSalon: (id: number) => void;
  selectService: (id: string) => void;
  selectMaster: (id: string) => void;
  clearService: () => void;
  handleNext: () => void;
  handleBack: () => void;
  handleConfirm: () => void;
  resetFlow: () => void;
  handleCloseSuccess: () => void;
  goStep: (idx: number) => void;
  onCategoryChange: (cat: string) => void;
  onDate: (d: string) => void;
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
  /* Clear every selection and return to the flow-choice entry screen. */
  const resetFlow = () => dispatch({ type: 'RESET' });
  /**
   * Enter a booking flow from the entry screen, resetting step/category state.
   * @param   {BookingFlow} f - The chosen flow (`salon-first` / `specialist-first`)
   * @returns {void}          -
   */
  const startFlow = (f: BookingFlow): void =>
    dispatch({ type: 'START_FLOW', flow: f });

  /**
   * Pick a studio; invalidates a chosen specialist who doesn't work there.
   * @param   {number} id - Salon id
   * @returns {void}      -
   */
  const selectSalon = (id: number): void =>
    dispatch({ type: 'SELECT_SALON', id });
  /**
   * Toggle a service in or out of the multi-selection; syncs the category tab
   * and invalidates a chosen specialist who performs NONE of the remaining picks.
   * @param   {string} id - Service id
   * @returns {void}      -
   */
  const selectService = (id: string): void =>
    dispatch({ type: 'SELECT_SERVICE', id });
  /* Clear every chosen service and unlock the (preselected) service step. */
  const clearService = () => dispatch({ type: 'CLEAR_SERVICE' });
  /**
   * Pick a specialist; auto-picks their single studio and invalidates a studio
   * the specialist cannot cover.
   * @param   {string} id - Specialist id (or the "any specialist" sentinel)
   * @returns {void}      -
   */
  const selectMaster = (id: string): void =>
    dispatch({ type: 'SELECT_MASTER', id });

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
   * @param   {number} idx - Target step index
   * @returns {void}       -
   */
  const goStep = (idx: number) => dispatch({ type: 'GO_STEP', idx });
  /**
   * Change the active service category tab.
   * @param   {string} cat - Category label (or `All`)
   * @returns {void}       -
   */
  const onCategoryChange = (cat: string) =>
    dispatch({ type: 'SET_CATEGORY', category: cat });
  /**
   * Pick an appointment day; clears the time (slots differ per day).
   * @param   {string} d - Date key `year-monthIndex-day`
   * @returns {void}     -
   */
  const onDate = (d: string) => dispatch({ type: 'SET_DATE', date: d });
  /**
   * Pick an appointment time slot.
   * @param   {string} t - Time slot `HH:MM`
   * @returns {void}     -
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
