'use client';

import { useEffect, useMemo, useState } from 'react';

import { TIMES } from '@/components/layout/booking-page/constants';
import { useBookingPayment } from '@/components/layout/booking-page/hooks/useBookingPayment';
import { useBookingSchedule } from '@/components/layout/booking-page/hooks/useBookingSchedule';
import { useBookingSubmit } from '@/components/layout/booking-page/hooks/useBookingSubmit';
import type {
  BookingData,
  BookingMaster,
  BookingSalon,
} from '@/components/layout/booking-page/types';
import dateKeyOffset from '@/components/layout/booking-page/utils/dateKeyOffset';
import masterMatchesSelection from '@/components/layout/booking-page/utils/masterMatchesSelection';
import slotFits from '@/components/layout/booking-page/utils/slotFits';

import type { OfferBookingInfo } from '../types';
import { dateKeyToDate } from '../utils/dateKeyToDate';
import { isPastSlot } from '../utils/isPastSlot';
import { offerBundledServices } from '../utils/offerBundledServices';

/** One cell of the modal's time grid. */
export interface OfferSlotOption {
  time: string;
  disabled: boolean;
}

/**
 * Everything the offer booking modal renders from.
 * @property {1 | 2}                    step             - Current wizard step: picks / summary
 * @property {() => void}               goToSummary      - Advance to the summary step (no-op until `step1Ready`)
 * @property {() => void}               goBack           - Return to the picks step
 * @property {number | null}            salonId          - Chosen salon page id
 * @property {(id: number) => void}     selectSalon      - Choose a salon (resets the specialist)
 * @property {BookingSalon | undefined} salonObj         - Resolved chosen salon
 * @property {string}                   masterId         - Chosen specialist id (`''` = none yet)
 * @property {(id: string) => void}     selectMaster     - Choose a specialist
 * @property {BookingMaster|undefined}  masterObj        - Resolved chosen specialist
 * @property {BookingMaster[]}          availableMasters - Specialists offered for this salon + package
 * @property {string}                   todayKey         - Date key of today
 * @property {string}                   tomorrowKey      - Date key of tomorrow
 * @property {string}                   dateKey          - Chosen day
 * @property {(key: string) => void}    pickDay          - Choose a day (clears the slot, closes the calendar)
 * @property {boolean}                  calOpen          - Whether the inline calendar replaces the slot grid
 * @property {() => void}               toggleCalendar   - Open/close the inline calendar
 * @property {number}                   calYear          - Year the calendar shows
 * @property {number}                   calMonth         - Month index (0-based) the calendar shows
 * @property {(year: number, month: number) => void} changeCalMonth - Page the calendar
 * @property {string}                   slot             - Chosen time slot (`''` = none yet)
 * @property {(time: string) => void}   selectSlot       - Choose a time slot
 * @property {OfferSlotOption[]}        slotOptions      - Time grid of the chosen day (with disabled tails)
 * @property {boolean}                  step1Ready       - Salon + specialist + slot all chosen
 * @property {boolean}                  isAuth           - Whether the client is signed in
 * @property {boolean}                  isLoading        - Order creation in flight
 * @property {string}                   error            - Order creation error (`''` = none)
 * @property {boolean}                  booked           - Confirmed — the modal shows the done screen
 * @property {() => void}               closeSuccess     - Finish the done screen: routes a real appointment to the profile (the modal shell calls it from its auto-close timer)
 * @property {() => void}               handleConfirm    - Confirm: sign-in popup when signed out, else create the order
 */
export interface OfferBookingController {
  step: 1 | 2;
  goToSummary: () => void;
  goBack: () => void;
  salonId: number | null;
  selectSalon: (id: number) => void;
  salonObj: BookingSalon | undefined;
  masterId: string;
  selectMaster: (id: string) => void;
  masterObj: BookingMaster | undefined;
  availableMasters: BookingMaster[];
  todayKey: string;
  tomorrowKey: string;
  dateKey: string;
  pickDay: (key: string) => void;
  calOpen: boolean;
  toggleCalendar: () => void;
  calYear: number;
  calMonth: number;
  changeCalMonth: (year: number, month: number) => void;
  slot: string;
  selectSlot: (time: string) => void;
  slotOptions: OfferSlotOption[];
  step1Ready: boolean;
  isAuth: boolean;
  isLoading: boolean;
  error: string;
  booked: boolean;
  closeSuccess: () => void;
  handleConfirm: () => void;
}

/**
 * useOfferBooking — the controller of the offer booking modal (mock
 * `OfferBookingModal.tsx` state): the salon / specialist / day / slot picks,
 * the derived rosters and time grid, and the confirm.
 *
 * It reuses the booking wizard's machinery rather than reimplementing it: the
 * schedule expansion (`useBookingSchedule` — the specialist's
 * `master_schedule`, falling back to the salon's `salon_time`), the shared
 * specialist predicate (`masterMatchesSelection`), the payment account
 * default and the whole submit path (`useBookingSubmit` — sign-in popup when
 * signed out, `orders` storage + `order` form when signed in). The
 * appointment length is the sum of the bundled services' durations, so the
 * slot grid disables tails exactly like the wizard's Date & Time step; the
 * order line, however, is the OFFER product itself (`sel.orderProducts`), so
 * the order totals the promised package price and names the package.
 * @param   {object}                 props       - Hook parameters
 * @param   {OfferBookingInfo}       props.offer - The offer being booked
 * @param   {BookingData}            props.data  - Salons / services / specialists from the CMS
 * @returns {OfferBookingController}             Modal state, derivations and handlers
 */
export const useOfferBooking = ({
  offer,
  data,
}: {
  offer: OfferBookingInfo;
  data: BookingData;
}): OfferBookingController => {
  const todayKey = useMemo(() => dateKeyOffset(0), []);
  const tomorrowKey = useMemo(() => dateKeyOffset(1), []);

  const [step, setStep] = useState<1 | 2>(1);
  const [salonId, setSalonId] = useState<number | null>(
    data.salons[0]?.id ?? null,
  );
  const [masterId, setMasterId] = useState('');
  const [dateKey, setDateKey] = useState(todayKey);
  const [slot, setSlot] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const bundledServices = useMemo(
    () => offerBundledServices(data.services, offer.serviceProductIds),
    [data.services, offer.serviceProductIds],
  );

  /**
   * Specialists able to perform the package at the chosen salon — the shared
   * wizard predicate over the RESOLVED bundle ids, so the modal and the
   * wizard fallback agree on who can serve the offer, and services the
   * catalog no longer carries do not skew the filter.
   */
  const availableMasters = useMemo(() => {
    const bundleIds = bundledServices.map((service) => service.id);
    return data.masters.filter((master) =>
      masterMatchesSelection(master, salonId, bundleIds),
    );
  }, [data.masters, salonId, bundledServices]);

  const salonObj = data.salons.find((s) => s.id === salonId);
  const masterObj = availableMasters.find((m) => m.id === masterId);

  const { slots, hasSchedule, durationMinutes, closeMinutes } =
    useBookingSchedule({
      masterObj,
      salonObj,
      serviceObjs: bundledServices,
      date: dateKey,
    });

  /**
   * The day's grid: real schedule slots, or the wizard's static fallback grid
   * when the CMS carries no schedule. Tails that no longer fit before closing
   * and today's already-passed times are disabled, not hidden — same rules as
   * the wizard's `TimeSlotGrid`.
   */
  const slotOptions = useMemo<OfferSlotOption[]>(
    () =>
      (hasSchedule ? slots : TIMES).map((time) => ({
        time,
        disabled:
          !slotFits(time, durationMinutes, closeMinutes) ||
          isPastSlot(time, dateKey),
      })),
    [hasSchedule, slots, durationMinutes, closeMinutes, dateKey],
  );

  /** A pick that stopped fitting (day or specialist changed) is dropped. */
  useEffect(() => {
    if (!slot) return;
    const option = slotOptions.find((o) => o.time === slot);
    if (!option || option.disabled) setSlot('');
  }, [slot, slotOptions]);

  const { paymentAccount } = useBookingPayment();
  const { submit, booked, closeSuccess, isAuth, isLoading, error } =
    useBookingSubmit({ paymentAccount, rescheduleOrderId: null });

  const step1Ready = salonId !== null && masterId !== '' && slot !== '';

  /**
   * Choose a salon; the specialist roster changes with it, so the pick resets
   * (the mock does the same).
   * @param   {number} id - Salon page id
   * @returns {void}
   */
  const selectSalon = (id: number): void => {
    setSalonId(id);
    setMasterId('');
  };

  /**
   * Choose a day from the chips or the calendar: the slot belongs to the old
   * day, so it clears, and the calendar folds back into the slot grid.
   * @param   {string} key - Date key `year-monthIndex-day`
   * @returns {void}
   */
  const pickDay = (key: string): void => {
    setDateKey(key);
    setSlot('');
    setCalOpen(false);
  };

  /**
   * Open the calendar on the month of the current pick (today's month when the
   * pick is one of the chips), or fold it back.
   * @returns {void}
   */
  const toggleCalendar = (): void => {
    const custom = dateKey !== todayKey && dateKey !== tomorrowKey;
    const base = dateKeyToDate(custom ? dateKey : todayKey);
    setCalYear(base.getFullYear());
    setCalMonth(base.getMonth());
    setCalOpen((open) => !open);
  };

  /**
   * Page the calendar to another month.
   * @param   {number} year  - Full year
   * @param   {number} month - Month index (0-based)
   * @returns {void}
   */
  const changeCalMonth = (year: number, month: number): void => {
    setCalYear(year);
    setCalMonth(month);
  };

  /**
   * Confirm the booking with everything picked in the modal. Signed out, this
   * opens the sign-in popup over the modal (see `useBookingSubmit`); signed
   * in, it creates the appointment and flips to the done screen. The order
   * line is the offer product itself — see `BookingSelection.orderProducts`.
   * @returns {void}
   */
  const handleConfirm = (): void => {
    void submit({
      salon: salonObj,
      services: bundledServices,
      master: masterObj,
      date: dateKey,
      time: slot,
      orderProducts: [{ productId: offer.productId, quantity: 1 }],
    });
  };

  return {
    step,
    goToSummary: () => {
      if (step1Ready) setStep(2);
    },
    goBack: () => setStep(1),
    salonId,
    selectSalon,
    salonObj,
    masterId,
    selectMaster: setMasterId,
    masterObj,
    availableMasters,
    todayKey,
    tomorrowKey,
    dateKey,
    pickDay,
    calOpen,
    toggleCalendar,
    calYear,
    calMonth,
    changeCalMonth,
    slot,
    selectSlot: setSlot,
    slotOptions,
    step1Ready,
    isAuth,
    isLoading,
    error,
    booked,
    closeSuccess,
    handleConfirm,
  };
};
