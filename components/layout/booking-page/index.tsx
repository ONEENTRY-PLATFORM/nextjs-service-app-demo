'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';
import {
  selectActiveItemId,
  selectCartData,
} from '@/app/store/reducers/CartSlice';

import BookingSummary from './components/BookingSummary';
import DateTimeStep from './components/DateTimeStep';
import EntryScreen from './components/EntryScreen';
import SalonStep from './components/SalonStep';
import ServiceStep from './components/ServiceStep';
import SpecialistStep from './components/SpecialistStep';
import StepBar from './components/StepBar';
import SuccessModal from './components/SuccessModal';
import {
  ANY_MASTER,
  BRAND_GRADIENT,
  CATEGORY_ORDER,
  FLOWS,
  MUTED,
  PINK,
} from './constants';
import type { BookingData, BookingFlow, StepKey } from './types';
import { useBookingSubmit } from './useBookingSubmit';

/**
 * BookingWizard — the interactive booking flow ported from the static-html
 * mock (`BookingPage.tsx` → `BookingPage`): an entry screen with two flows
 * (studio-first / specialist-first), a step bar, the four wizard steps with
 * cross-filtering between studio / service / specialist, the "Your
 * Appointment" summary (right column on desktop, a separate screen on
 * mobile) and the success modal.
 *
 * A selection stashed in the booking cart (a "Book" button elsewhere in the
 * app, or a "repeat" action in the profile) preselects the matching entities
 * and fast-forwards the wizard, mirroring the mock's `preselectMasterId` /
 * `preselectServiceId` / `rescheduleToken` inputs.
 * @param   {object}      props      - Component properties
 * @param   {BookingData} props.data - Salons, services and specialists (CMS or demo)
 * @returns {JSX.Element}            Booking wizard
 */
const BookingWizard = ({ data }: { data: BookingData }): JSX.Element => {
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

  return (
    <section
      id="booking-section"
      className="flex-1 py-6 xl:pb-12 md:py-12 md:pb-20"
      style={{ background: 'linear-gradient(180deg,#f7f7fb 0%,#fff 60%)' }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        {flow && (
          <div className="mb-6 md:mb-10">
            <StepBar
              steps={stepKeys}
              currentIdx={stepIdx}
              onGo={(idx) => {
                setTouched(true);
                setStepIdx(idx);
              }}
            />
          </div>
        )}
        <div className="grid grid-cols-1 items-stretch gap-8 xl:grid-cols-3">
          <div
            className={`h-full xl:col-span-2 xl:block ${mobileSummary ? 'hidden' : ''}`}
          >
            <div
              className="-mx-3 flex h-full flex-col rounded-none bg-white px-4 py-6 md:mx-0 md:rounded-3xl md:p-8"
              style={{ boxShadow: '0 4px 40px rgba(237,33,241,0.08)' }}
            >
              <div
                className="flex-1"
                key={flow ? `${flow}-${currentStepKey}` : 'entry'}
              >
                {!flow && <EntryScreen onChoose={startFlow} />}
                {flow && currentStepKey === 'salon' && (
                  <SalonStep
                    salons={filteredSalons}
                    selected={salon}
                    onSelect={selectSalon}
                  />
                )}
                {flow && currentStepKey === 'service' && (
                  <ServiceStep
                    services={filteredServices}
                    selected={service}
                    onSelect={selectService}
                  />
                )}
                {flow && currentStepKey === 'specialist' && (
                  <SpecialistStep
                    masters={filteredMasters}
                    selected={master}
                    onSelect={selectMaster}
                    allowAny
                    service={serviceObj}
                    onClearService={clearService}
                    categories={categories}
                    categoryFilter={categoryFilter}
                    onCategoryChange={(cat) => {
                      setTouched(true);
                      setCategoryFilter(cat);
                    }}
                    salons={salons}
                    selectedSalon={salonObj}
                  />
                )}
                {flow && currentStepKey === 'datetime' && (
                  <DateTimeStep
                    selectedDate={date}
                    selectedTime={time}
                    onDate={(d) => {
                      setTouched(true);
                      setDate(d);
                    }}
                    onTime={(t) => {
                      setTouched(true);
                      setTime(t);
                    }}
                    demo={demo}
                  />
                )}
              </div>
              {flow && (
                <div className="mt-auto flex items-stretch gap-3 pt-8">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition-all hover:opacity-80 md:text-base"
                    style={{ background: '#f7f7fb', color: MUTED }}
                  >
                    <ChevronLeft size={16} />{' '}
                    {stepIdx === 0 ? 'Change start' : 'Back'}
                  </button>
                  {!isLastStep && (
                    <button
                      onClick={handleNext}
                      disabled={!canNext}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider uppercase transition-all enabled:hover:scale-[1.02] enabled:active:scale-[0.98] md:text-base"
                      style={{
                        background: canNext ? BRAND_GRADIENT : '#f7f7fb',
                        color: canNext ? '#fff' : MUTED,
                        boxShadow: canNext ? `0 6px 20px ${PINK}44` : 'none',
                        cursor: canNext ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  )}
                  {/* Mobile: on the last step Continue leads to the summary */}
                  {isLastStep && (
                    <button
                      onClick={() => setMobileSummary(true)}
                      disabled={!time}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider uppercase transition-all enabled:hover:scale-[1.02] enabled:active:scale-[0.98] xl:hidden md:text-base"
                      style={{
                        background: time ? BRAND_GRADIENT : '#f7f7fb',
                        color: time ? '#fff' : MUTED,
                        boxShadow: time ? `0 6px 20px ${PINK}44` : 'none',
                        cursor: time ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: summary is a separate screen reached via Continue.
              Desktop: always in the right column. */}
          <div
            className={`h-full xl:col-span-1 xl:block ${
              flow && isLastStep && mobileSummary ? '' : 'hidden'
            }`}
          >
            <button
              onClick={() => setMobileSummary(false)}
              className="mb-4 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold tracking-wider uppercase xl:hidden"
              style={{ background: '#f7f7fb', color: MUTED }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <BookingSummary
              flow={flow}
              salon={salonObj}
              service={serviceObj}
              master={masterObj}
              masterAny={master === ANY_MASTER}
              date={date}
              time={time}
              currentIdx={stepIdx}
              totalSteps={stepKeys.length}
              onBook={handleConfirm}
              isLoggedIn={isAuth}
              isLoading={isLoading}
              error={error}
              onReset={resetFlow}
            />
          </div>
        </div>
      </div>

      {booked && <SuccessModal onClose={handleCloseSuccess} />}
    </section>
  );
};

export default BookingWizard;
