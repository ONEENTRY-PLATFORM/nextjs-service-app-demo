import bookingStepKeys from './bookingStepKeys';
import { ANY_MASTER } from './constants';
import type { BookingData, BookingFlow } from './types';

/**
 * The wizard's own state — the 11 cells that used to be separate `useState`
 * calls in `useBookingWizard`, minus the `pendingDateTime` crutch (folded into
 * {@link PreselectPreset}, which computes the target step in one shot).
 *
 * `mobileSummary` and `booked` stay as their own `useState` in the hook: they
 * are view state, not part of this state machine.
 *
 * Navigation is kept as `stepIdx` into the derived `bookingStepKeys` list,
 * exactly as before — a deliberate choice over a `step: StepKey` model, so the
 * "Change" transitions that work by the step list growing/shrinking keep their
 * current behavior verbatim. The reducer only *clamps* `stepIdx` into range
 * (see the anchor in {@link makeBookingReducer}) so `currentStepKey` can no
 * longer fall off the end of the list.
 */
export interface BookingState {
  /** Chosen flow, `null` on the entry screen */
  flow: BookingFlow | null;
  /** Index of the active step within the flow's `bookingStepKeys` list */
  stepIdx: number;
  /** Chosen salon id */
  salon: number | null;
  /** Chosen service ids, in the order they were picked */
  serviceIds: string[];
  /** Chosen specialist id (`''`, an id, or `__any__`) */
  master: string;
  /** Chosen date key */
  date: string;
  /** Chosen time slot */
  time: string;
  /** Active category pill */
  categoryFilter: string;
  /** The service was preselected upstream — hides the Service step */
  serviceLocked: boolean;
  /** The user has interacted — a late cart rehydration must not override them */
  touched: boolean;
}

/** The initial wizard state (entry screen, nothing chosen). */
export const initialBookingState: BookingState = {
  flow: null,
  stepIdx: 0,
  salon: null,
  serviceIds: [],
  master: '',
  date: '',
  time: '',
  categoryFilter: 'All',
  serviceLocked: false,
  touched: false,
};

/** The selection fields a preselection may patch. */
type PreselectPatch = Partial<
  Pick<
    BookingState,
    | 'flow'
    | 'master'
    | 'serviceIds'
    | 'salon'
    | 'categoryFilter'
    | 'serviceLocked'
  >
>;

/**
 * A preselection (cart / reschedule / offer) applied in one action, replacing
 * the 8-setter bag `useBookingPreselect` used to poke.
 *
 * `patch` is a **partial** merge on purpose: the three preselect branches each
 * set a different subset of fields (the specialist-only branch never touches the
 * services, the service-only branch never touches the master), so unset fields
 * must keep their current value exactly as the old setters left them. `stepIdx`
 * may be `'last'` to land on the final step of the resolved flow — the
 * repeat/reschedule jump that used to need the `pendingDateTime` round-trip.
 */
export interface PreselectPreset {
  patch: PreselectPatch;
  stepIdx: number | 'last';
}

/** Every wizard transition, as a discriminated action. */
export type BookingAction =
  | { type: 'START_FLOW'; flow: BookingFlow }
  | { type: 'SELECT_SALON'; id: number }
  | { type: 'SELECT_SERVICE'; id: string }
  | { type: 'CLEAR_SERVICE' }
  | { type: 'SELECT_MASTER'; id: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GO_STEP'; idx: number }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_TIME'; time: string }
  | { type: 'SET_DATE_TODAY'; date: string }
  | { type: 'DROP_TIME' }
  | { type: 'PRESELECT'; preset: PreselectPreset }
  | { type: 'RESET' };

/**
 * Step list for a state — the same derivation the hook renders from, used inside
 * the reducer for `NEXT` bounds, the `'last'` preselect target and the clamp.
 * @param   {BookingState}                state - Wizard state
 * @param   {BookingData}                 data  - Salons, services and specialists
 * @returns {import('./types').StepKey[]}       Step keys in order
 */
const keysOf = (state: BookingState, data: BookingData) =>
  bookingStepKeys({
    flow: state.flow,
    serviceLocked: state.serviceLocked,
    master: state.master,
    masters: data.masters,
    salons: data.salons,
  });

/**
 * Category pill implied by a service selection: a single shared category selects
 * that pill, a mixed pick (or an empty one) falls back to "All".
 * @param   {string[]}    serviceIds - Chosen service ids
 * @param   {BookingData} data       - Salons, services and specialists
 * @returns {string}                 Category label, or `'All'`
 */
const categoryOf = (serviceIds: string[], data: BookingData): string => {
  const cats = [
    ...new Set(
      serviceIds
        .map((sid) => data.services.find((x) => x.id === sid)?.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
  return cats.length === 1 ? (cats[0] ?? 'All') : 'All';
};

/**
 * Apply one action to the state, without the step clamp — the pure transition
 * table. {@link makeBookingReducer} wraps this to clamp `stepIdx` afterwards.
 * @param   {BookingState}  state  - Current state
 * @param   {BookingAction} action - Action to apply
 * @param   {BookingData}   data   - Salons, services and specialists
 * @returns {BookingState}         Next state (pre-clamp)
 */
const transition = (
  state: BookingState,
  action: BookingAction,
  data: BookingData,
): BookingState => {
  switch (action.type) {
    case 'START_FLOW':
      return {
        ...state,
        touched: true,
        flow: action.flow,
        stepIdx: 0,
        categoryFilter: 'All',
        serviceLocked: false,
      };

    case 'SELECT_SALON': {
      const next = { ...state, touched: true, salon: action.id };
      /** Invalidate a chosen master who doesn't work at this studio */
      if (state.master && state.master !== ANY_MASTER) {
        const m = data.masters.find((x) => x.id === state.master);
        if (m && m.salonIds.length > 0 && !m.salonIds.includes(action.id)) {
          next.master = '';
        }
      }
      return next;
    }

    case 'SELECT_SERVICE': {
      const serviceIds = state.serviceIds.includes(action.id)
        ? state.serviceIds.filter((x) => x !== action.id)
        : [...state.serviceIds, action.id];
      const next: BookingState = {
        ...state,
        touched: true,
        serviceIds,
        categoryFilter: categoryOf(serviceIds, data),
      };
      /** Invalidate a chosen master who performs none of the remaining picks */
      if (
        state.master &&
        state.master !== ANY_MASTER &&
        serviceIds.length > 0
      ) {
        const m = data.masters.find((x) => x.id === state.master);
        if (
          m &&
          m.serviceIds.length > 0 &&
          !serviceIds.some((sid) => m.serviceIds.includes(sid))
        ) {
          next.master = '';
        }
      }
      return next;
    }

    case 'CLEAR_SERVICE':
      return {
        ...state,
        touched: true,
        serviceIds: [],
        serviceLocked: false,
        categoryFilter: 'All',
      };

    case 'SELECT_MASTER': {
      const next: BookingState = { ...state, touched: true, master: action.id };
      if (action.id && action.id !== ANY_MASTER) {
        const m = data.masters.find((x) => x.id === action.id);
        /** Invalidate a chosen studio the specialist doesn't work at */
        if (
          state.salon &&
          m &&
          m.salonIds.length > 0 &&
          !m.salonIds.includes(state.salon)
        ) {
          next.salon = null;
        }
        /** Auto-pick a single studio — skips the Salon step entirely */
        if (m?.salonIds.length === 1) next.salon = m.salonIds[0] ?? null;
      }
      return next;
    }

    case 'NEXT': {
      const keys = keysOf(state, data);
      return state.stepIdx < keys.length - 1
        ? { ...state, stepIdx: state.stepIdx + 1 }
        : state;
    }

    case 'BACK':
      return state.stepIdx > 0
        ? { ...state, touched: true, stepIdx: state.stepIdx - 1 }
        : { ...state, touched: true, flow: null };

    case 'GO_STEP':
      return { ...state, touched: true, stepIdx: action.idx };

    case 'SET_CATEGORY':
      return { ...state, touched: true, categoryFilter: action.category };

    case 'SET_DATE':
      /** A new day has its own slots — drop a time that may not exist on it */
      return { ...state, touched: true, date: action.date, time: '' };

    case 'SET_TIME':
      return { ...state, touched: true, time: action.time };

    case 'SET_DATE_TODAY':
      /** Hydration auto-pick of "today" — not a user interaction, no `touched` */
      return { ...state, date: action.date };

    case 'DROP_TIME':
      /** A slot that stopped fitting is dropped — not a user interaction */
      return { ...state, time: '' };

    case 'PRESELECT': {
      const { preset } = action;
      /** Partial merge — unset fields keep their current value (see the type). */
      const next: BookingState = { ...state, ...preset.patch };
      const keys = keysOf(next, data);
      next.stepIdx =
        preset.stepIdx === 'last'
          ? Math.max(0, keys.length - 1)
          : preset.stepIdx;
      return next;
    }

    case 'RESET':
      return { ...initialBookingState, touched: true };

    default:
      return state;
  }
};

/**
 * makeBookingReducer — the wizard reducer, curried over the CMS `data` its
 * transitions and step order depend on (`useReducer(makeBookingReducer(data),
 * initialBookingState)`).
 *
 * After every transition it clamps `stepIdx` into the current step list — the
 * anchor that makes an out-of-range step (a `currentStepKey` of `undefined`)
 * unrepresentable. In normal flows `stepIdx` is always valid, so the clamp is a
 * no-op; it only bites the transient where the step list shrank below the
 * cursor.
 * @param   {BookingData}                                                  data - Salons, services and specialists
 * @returns {(state: BookingState, action: BookingAction) => BookingState}      Reducer
 */
export const makeBookingReducer =
  (data: BookingData) =>
  (state: BookingState, action: BookingAction): BookingState => {
    const next = transition(state, action, data);
    if (!next.flow) return next;
    const keys = keysOf(next, data);
    if (keys.length === 0) return next;
    const clamped = Math.min(next.stepIdx, keys.length - 1);
    return clamped === next.stepIdx ? next : { ...next, stepIdx: clamped };
  };
