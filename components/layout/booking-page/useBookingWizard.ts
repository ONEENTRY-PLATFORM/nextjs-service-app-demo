'use client';

import type { IAccountsEntity } from 'oneentry/dist/payments/paymentsInterfaces';
import { useContext, useMemo, useState } from 'react';

import { usePaymentAccounts } from '@/app/api/hooks/usePaymentAccounts';
import { isOnlinePayment } from '@/app/api/utils/isOnlinePayment';
import { useAppSelector } from '@/app/store/hooks';
import { PAYMENT_ACCOUNT_CASH } from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';
import {
  selectActiveItemId,
  selectCartData,
} from '@/app/store/reducers/CartSlice';
import { useHydrated } from '@/app/store/useHydrated';

import {
  ANY_MASTER,
  CATEGORY_ORDER,
  FALLBACK_CLOSE_MINUTES,
  FLOWS,
} from './constants';
import dayCloseMinutes from './dayCloseMinutes';
import daySlots from './daySlots';
import slotFits from './slotFits';
import totalServiceMinutes from './totalServiceMinutes';
import type {
  BookingData,
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
  StepKey,
} from './types';
import { useBookingSubmit } from './useBookingSubmit';

/** Everything render needs from the controller hook. */
export interface BookingWizardState {
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
  /** Category pill labels (with "All") */
  categories: string[];
  /** Active category pill */
  categoryFilter: string;
  /** All salons */
  salons: BookingSalon[];
  /** Salons narrowed to the chosen specialist */
  filteredSalons: BookingSalon[];
  /** Services narrowed by the specialist-first flow */
  filteredServices: BookingService[];
  /** Specialists narrowed by salon / service / category */
  filteredMasters: BookingMaster[];
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
  /** Booking slots (`HH:MM`) for the chosen day, from the schedule; `[]` if none */
  slots: string[];
  /** Whether a CMS schedule drives the slots (else the step falls back to the static grid) */
  hasSchedule: boolean;
  /** Total length of the chosen services in minutes (`0` when none are chosen) */
  durationMinutes: number;
  /** Closing time of the chosen day, minutes since midnight; `null` when unknown */
  closeMinutes: number | null;
  /** Resolved chosen salon */
  salonObj: BookingSalon | undefined;
  /** Resolved chosen services (order matches {@link selectedServiceIds}) */
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
  /** Payment accounts the salon offers for these orders (see `usePaymentAccounts`) */
  paymentAccounts: IAccountsEntity[];
  /** Identifier of the payment account the order will use */
  paymentAccount: string;
  /** Choose a payment account */
  selectPaymentAccount: (identifier: string) => void;
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
 * useBookingWizard — the controller of all wizard state,
 * the cross-filters between studio / service / specialist, the dynamic step
 * order, cart preselection (React's "adjust state on prop change" pattern) and
 * every handler. Kept as a hook so the component stays a thin render.
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

  /**
   * Payment accounts the salon actually offers for these orders, and the
   * client's pick. A single-account salon never sees a picker at all — the
   * choice only appears because more than one account is linked.
   *
   * The default is the OFFLINE account (pay at the salon), not simply the first
   * one the API returns: the design books an appointment without asking about
   * payment at all, so paying on site is the expected path, and `getAccounts`
   * happens to list the online provider first — defaulting to it would send
   * every client who ignores the picker to a payment gateway.
   */
  const { isAuth: authed } = useContext(AuthContext);
  const { accounts: paymentAccounts } = usePaymentAccounts({ isAuth: authed });
  const [paymentAccount, setPaymentAccount] = useState('');
  const offlineAccount = paymentAccounts.find(
    (account) => !isOnlinePayment(account.identifier),
  );
  const activePaymentAccount =
    paymentAccount ||
    offlineAccount?.identifier ||
    paymentAccounts[0]?.identifier ||
    PAYMENT_ACCOUNT_CASH;

  const { submit, booked, closeSuccess, isAuth, isLoading, error } =
    useBookingSubmit({ paymentAccount: activePaymentAccount });

  /** ── Preselection from the booking cart ──────────────────────────────── */
  const activeId = useAppSelector(selectActiveItemId);
  const cartItems = useAppSelector(selectCartData);
  const cartItem = cartItems.find((item) => item.id === activeId);
  const cartMasterId = cartItem?.masterId;
  const cartProductId = cartItem?.productId;
  const cartSalonId = cartItem?.salonId;
  /** The user's own interaction wins over a late cart rehydration */
  const [touched, setTouched] = useState(false);

  /**
   * The cart lives in `redux-persist` (localStorage), so the server cannot know
   * it. Applying the preselection during the FIRST client render would make the
   * hydrated tree differ from the server HTML — React throws "Hydration failed"
   * and re-renders the whole page on the client. `useSyncExternalStore` returns
   * the server snapshot (`false`) for SSR *and* the hydration render, then the
   * client snapshot (`true`) right after: the first render matches the server,
   * and the jump to the preselected step lands in the very next commit.
   */
  const hydrated = useHydrated();

  /**
   * Preselection is applied while rendering (React's "adjust state on prop
   * change" pattern, no effect): once per distinct cart content and never
   * over a flow the user has already started themselves.
   */
  const cartKey = hydrated
    ? `${cartMasterId ?? ''}:${cartProductId ?? ''}:${cartSalonId ?? ''}`
    : '';
  const [appliedCartKey, setAppliedCartKey] = useState('');
  if (cartKey !== appliedCartKey) {
    setAppliedCartKey(cartKey);
    const preMaster = cartMasterId
      ? masters.find((m) => m.adminId === cartMasterId)
      : undefined;
    const preService = cartProductId
      ? services.find((s) => s.productId === cartProductId)
      : undefined;
    const preSalon = cartSalonId
      ? salons.find((s) => s.id === String(cartSalonId))
      : undefined;

    if (touched) {
      /** Skip — the user is already in a flow of their own */
    } else if (preMaster && preService) {
      /** Repeat/reschedule: everything known → jump to Date & Time */
      setFlow('specialist-first');
      setMaster(preMaster.id);
      setServiceIds([preService.id]);
      setSalon(preSalon?.id ?? preMaster.salonIds[0] ?? '');
      setCategoryFilter(preService.category);
      setPendingDateTime(true);
    } else if (preMaster) {
      /** From a specialist profile → specialist-first, land on the next step */
      setFlow('specialist-first');
      setMaster(preMaster.id);
      setSalon(
        preMaster.salonIds.length === 1 ? (preMaster.salonIds[0] ?? '') : '',
      );
      setStepIdx(1);
    } else if (preService) {
      /** From Services & Prices / an offer → salon-first, service locked */
      setFlow('salon-first');
      setServiceIds([preService.id]);
      setServiceLocked(true);
      setCategoryFilter(preService.category);
      setStepIdx(0);
    }
  }

  /** ── Derived entities & cross-filters (mock `BookingPage` logic) ─────── */
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

  /**
   * Slot source for the Date & Time step: the chosen specialist's
   * `master_schedule`, or — for "Any specialist" / before one is picked — the
   * chosen salon's `salon_time`. `hasSchedule` distinguishes "no schedule in the
   * CMS" (fall back to the static grid) from "open that day has no slots" (show
   * none), which an empty `slots` alone cannot.
   */
  const daySchedule = masterObj?.schedule ?? salonObj?.schedule;
  const hasSchedule = Boolean(daySchedule);
  const slots = useMemo(
    () => (date && daySchedule ? daySlots(daySchedule, date) : []),
    [date, daySchedule],
  );

  /**
   * How long the visit runs and when the studio shuts — together they cut the
   * tail off the time grid: a 90-minute visit cannot start an hour before
   * closing. Without a CMS schedule the static grid stands in, so its own
   * closing time does too.
   */
  const durationMinutes = useMemo(
    () => totalServiceMinutes(serviceObjs),
    [serviceObjs],
  );
  const closeMinutes = useMemo(
    () =>
      hasSchedule
        ? date
          ? dayCloseMinutes(daySchedule, date)
          : null
        : FALLBACK_CLOSE_MINUTES,
    [hasSchedule, daySchedule, date],
  );

  /**
   * Drop a time that stopped fitting — the services can be changed after the
   * slot was picked (step bar, "Change"), and a longer visit must not silently
   * keep a start that now runs past closing. Adjusted while rendering (React's
   * "derive state during render" pattern), so the step never paints a selected
   * slot that its own grid shows as disabled.
   */
  if (time && !slotFits(time, durationMinutes, closeMinutes)) {
    setTime('');
  }

  /** Category pills: All + the categories the services actually cover */
  const categories = useMemo(() => {
    const present = new Set(services.map((s) => s.category));
    return [
      'All',
      ...CATEGORY_ORDER.filter((c) => present.has(c)),
      ...[...present].filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
  }, [services]);

  /**
   * Salon → narrows specialists; service → narrows specialists; category tab
   * → narrows specialists. In the specialist-first flow the salon is chosen
   * BY the specialist, so the roster is not pre-filtered by salon. Empty CMS
   * link arrays mean "no restriction".
   */
  const filteredMasters = useMemo(() => {
    return masters.filter((m) => {
      if (
        flow === 'salon-first' &&
        salon &&
        m.salonIds.length > 0 &&
        !m.salonIds.includes(salon)
      ) {
        return false;
      }
      /** Keep specialists who perform AT LEAST ONE of the picked services */
      if (
        serviceIds.length > 0 &&
        m.serviceIds.length > 0 &&
        !serviceIds.some((sid) => m.serviceIds.includes(sid))
      ) {
        return false;
      }
      if (categoryFilter !== 'All' && m.serviceIds.length > 0) {
        const matchesCat = m.serviceIds.some((sid) => {
          const sv = services.find((x) => x.id === sid);
          return sv?.category === categoryFilter;
        });
        if (!matchesCat) return false;
      }
      return true;
    });
  }, [masters, flow, salon, serviceIds, categoryFilter, services]);

  /** Salons narrowed to the chosen specialist's studios */
  const filteredSalons = useMemo(() => {
    if (!master || master === ANY_MASTER) return salons;
    const m = masters.find((x) => x.id === master);
    if (!m || m.salonIds.length === 0) return salons;
    return salons.filter((s) => m.salonIds.includes(s.id));
  }, [salons, master, masters]);

  /**
   * In the specialist-first flow the Service step only offers what the chosen
   * specialist performs. For a concrete specialist the WHOLE of their roster is
   * shown across categories — the step's own category pills browse within it,
   * and a multi-pick may span categories, so it must not be pre-narrowed by
   * `categoryFilter` (which the pick itself keeps re-syncing). "Any specialist"
   * has no roster to define the set, so it stays locked to the category they
   * were chosen through.
   */
  const filteredServices = useMemo(() => {
    if (flow !== 'specialist-first' || !master) return services;
    if (master === ANY_MASTER) {
      return categoryFilter === 'All'
        ? services
        : services.filter((s) => s.category === categoryFilter);
    }
    const m = masters.find((x) => x.id === master);
    if (!m || m.serviceIds.length === 0) return services;
    return services.filter((s) => m.serviceIds.includes(s.id));
  }, [flow, master, masters, services, categoryFilter]);

  /**
   * Step order is dynamic: specialist-first adds a Salon step only when the
   * chosen specialist works at multiple studios (or "Any specialist" was
   * picked — the studio is then the client's choice).
   */
  const stepKeys = useMemo<StepKey[]>(() => {
    if (!flow) return [];
    if (flow === 'salon-first') {
      return serviceLocked
        ? ['salon', 'specialist', 'datetime']
        : FLOWS['salon-first'];
    }
    const m = masters.find((x) => x.id === master);
    const salonCount =
      master === ANY_MASTER
        ? salons.length
        : (m?.salonIds.length ?? 0) || salons.length;
    return salonCount > 1
      ? ['specialist', 'salon', 'service', 'datetime']
      : ['specialist', 'service', 'datetime'];
  }, [flow, serviceLocked, master, masters, salons]);
  const currentStepKey = stepKeys[stepIdx];

  /** Once the step list reflects the preselected master, jump to Date & Time */
  if (pendingDateTime && stepKeys.length > 0) {
    setPendingDateTime(false);
    setStepIdx(stepKeys.length - 1);
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

  /** Advance to the next step, unless already on the last one. */
  const handleNext = () => {
    if (!isLastStep) setStepIdx((s) => s + 1);
  };
  /** Step back; from the first step this exits the flow to the entry screen. */
  const handleBack = () => {
    setTouched(true);
    if (stepIdx > 0) setStepIdx((s) => s - 1);
    else setFlow(null);
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
    flow,
    stepKeys,
    stepIdx,
    currentStepKey,
    mobileSummary,
    setMobileSummary,
    categories,
    categoryFilter,
    salons,
    filteredSalons,
    filteredServices,
    filteredMasters,
    salon,
    selectedServiceIds: serviceIds,
    master,
    date,
    time,
    slots,
    hasSchedule,
    durationMinutes,
    closeMinutes,
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
    paymentAccounts,
    paymentAccount: activePaymentAccount,
    selectPaymentAccount: setPaymentAccount,
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
