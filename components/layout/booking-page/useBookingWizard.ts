'use client';

import { useMemo, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';
import {
  selectActiveItemId,
  selectCartData,
} from '@/app/store/reducers/CartSlice';

import { ANY_MASTER, CATEGORY_ORDER, FLOWS } from './constants';
import type {
  BookingData,
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
  StepKey,
} from './types';
import { useBookingSubmit } from './useBookingSubmit';

/** Everything the {@link BookingWizard} render needs from the controller hook. */
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
  /** CMS is empty and demo data is shown */
  demo: boolean;
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
  /** Chosen service id */
  service: string;
  /** Chosen specialist id (`''`, id or `__any__`) */
  master: string;
  /** Chosen date (ISO day) */
  date: string;
  /** Chosen time slot */
  time: string;
  /** Resolved chosen salon */
  salonObj: BookingSalon | undefined;
  /** Resolved chosen service */
  serviceObj: BookingService | undefined;
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
  /** Choose a service */
  selectService: (id: string) => void;
  /** Choose a specialist */
  selectMaster: (id: string) => void;
  /** Clear the chosen service ("Change") */
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
 * useBookingWizard — the controller of {@link BookingWizard}: all wizard state,
 * the cross-filters between studio / service / specialist, the dynamic step
 * order, cart preselection (React's "adjust state on prop change" pattern) and
 * every handler. Kept as a hook so the component stays a thin render.
 * @param   {BookingData}        data - Salons, services and specialists (CMS or demo)
 * @returns {BookingWizardState}      Wizard state and handlers
 */
export const useBookingWizard = (data: BookingData): BookingWizardState => {
  const { salons, services, masters, demo } = data;

  const [flow, setFlow] = useState<BookingFlow | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [salon, setSalon] = useState('');
  const [service, setService] = useState('');
  const [master, setMaster] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  /** True when the service was preselected upstream — hide the Service step */
  const [serviceLocked, setServiceLocked] = useState(false);
  /** Jump to the Date & Time step once the step list settles (repeat flow) */
  const [pendingDateTime, setPendingDateTime] = useState(false);

  const { submit, booked, closeSuccess, isAuth, isLoading, error } =
    useBookingSubmit();

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
   * Preselection is applied while rendering (React's "adjust state on prop
   * change" pattern, no effect): once per distinct cart content and never
   * over a flow the user has already started themselves.
   */
  const cartKey = `${cartMasterId ?? ''}:${cartProductId ?? ''}:${cartSalonId ?? ''}`;
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
      setService(preService.id);
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
      setService(preService.id);
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
  const serviceObj = useMemo(
    () => services.find((s) => s.id === service),
    [services, service],
  );
  const masterObj = useMemo(
    () =>
      master === ANY_MASTER ? undefined : masters.find((m) => m.id === master),
    [masters, master],
  );

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
      if (
        service &&
        m.serviceIds.length > 0 &&
        !m.serviceIds.includes(service)
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
  }, [masters, flow, salon, service, categoryFilter, services]);

  /** Salons narrowed to the chosen specialist's studios */
  const filteredSalons = useMemo(() => {
    if (!master || master === ANY_MASTER) return salons;
    const m = masters.find((x) => x.id === master);
    if (!m || m.salonIds.length === 0) return salons;
    return salons.filter((s) => m.salonIds.includes(s.id));
  }, [salons, master, masters]);

  /**
   * In the specialist-first flow the Service step only offers what the
   * chosen specialist performs, narrowed to the category they were chosen
   * through ("Any specialist" → that category's services).
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
    return services.filter(
      (s) =>
        m.serviceIds.includes(s.id) &&
        (categoryFilter === 'All' || s.category === categoryFilter),
    );
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
    service: Boolean(service),
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

  const handleNext = () => {
    if (!isLastStep) setStepIdx((s) => s + 1);
  };
  const handleBack = () => {
    setTouched(true);
    if (stepIdx > 0) setStepIdx((s) => s - 1);
    else setFlow(null);
  };
  const resetFlow = () => {
    setTouched(true);
    setFlow(null);
    setStepIdx(0);
    setSalon('');
    setService('');
    setMaster('');
    setDate('');
    setTime('');
    setCategoryFilter('All');
    setServiceLocked(false);
  };
  const startFlow = (f: BookingFlow) => {
    setTouched(true);
    setFlow(f);
    setStepIdx(0);
    setCategoryFilter('All');
    setServiceLocked(false);
  };

  const selectSalon = (id: string) => {
    setTouched(true);
    setSalon(id);
    /** Invalidate a chosen master who doesn't work at this studio */
    if (master && master !== ANY_MASTER) {
      const m = masters.find((x) => x.id === master);
      if (m && m.salonIds.length > 0 && !m.salonIds.includes(id)) setMaster('');
    }
  };
  const selectService = (id: string) => {
    setTouched(true);
    setService(id);
    /** Sync the category tab to the service for the specialist step */
    const sv = services.find((x) => x.id === id);
    if (sv) setCategoryFilter(sv.category);
    /** Invalidate a chosen master who doesn't perform this service */
    if (master && master !== ANY_MASTER) {
      const m = masters.find((x) => x.id === master);
      if (m && m.serviceIds.length > 0 && !m.serviceIds.includes(id))
        setMaster('');
    }
  };
  const clearService = () => {
    setTouched(true);
    setService('');
    setServiceLocked(false);
    setCategoryFilter('All');
  };
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
      /** Invalidate a chosen service the specialist doesn't perform */
      if (
        service &&
        m &&
        m.serviceIds.length > 0 &&
        !m.serviceIds.includes(service)
      ) {
        setService('');
        setCategoryFilter('All');
      }
    }
  };

  const handleConfirm = () => {
    void submit({
      salon: salonObj,
      service: serviceObj,
      master: masterObj,
      date,
      time,
    });
  };
  const handleCloseSuccess = () => {
    closeSuccess();
    resetFlow();
  };
  const goStep = (idx: number) => {
    setTouched(true);
    setStepIdx(idx);
  };
  const onCategoryChange = (cat: string) => {
    setTouched(true);
    setCategoryFilter(cat);
  };
  const onDate = (d: string) => {
    setTouched(true);
    setDate(d);
  };
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
    demo,
    categories,
    categoryFilter,
    salons,
    filteredSalons,
    filteredServices,
    filteredMasters,
    salon,
    service,
    master,
    date,
    time,
    salonObj,
    serviceObj,
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
