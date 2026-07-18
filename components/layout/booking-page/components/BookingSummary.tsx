'use client';

import { Calendar, MapPin, Scissors, User } from 'lucide-react';
import type { IAccountsEntity } from 'oneentry/dist/payments/paymentsInterfaces';
import type { JSX } from 'react';

import { BRAND_GRADIENT, DARK, MONTHS, MUTED, PINK, PINK2 } from '../constants';
import type {
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
} from '../types';
import MasterSummaryCard from './MasterSummaryCard';
import PaymentMethodPicker from './PaymentMethodPicker';
import Price from './Price';
import SummaryRow from './SummaryRow';

/**
 * BookingSummary — the "Your Appointment" sidebar of the booking wizard,
 * ported from the static-html mock (`BookingPage.tsx` → `BookingSummary`):
 * a gradient header with a Reset link, the picked studio / service /
 * specialist / date rows, the total and the confirm button (its label walks
 * through "Step x of y" → "Sign in to book" / "Book Appointment").
 * @param   {object}                     props                        - Component properties
 * @param   {BookingFlow | null}         props.flow                   - Active flow (`null` on the entry screen)
 * @param   {BookingSalon | undefined}   props.salon                  - Picked salon
 * @param   {BookingService | undefined} props.service                - Picked service
 * @param   {BookingMaster | undefined}  props.master                 - Picked specialist
 * @param   {boolean}                    props.masterAny              - "Any specialist" picked
 * @param   {string}                     props.date                   - Picked date key `y-m-d`
 * @param   {string}                     props.time                   - Picked time `HH:MM`
 * @param   {number}                     props.currentIdx             - Index of the active step
 * @param   {number}                     props.totalSteps             - Step count of the flow
 * @param   {() => void}                 props.onBook                 - Confirm the booking
 * @param   {boolean}                    props.isLoggedIn             - Whether the client is signed in
 * @param   {boolean}                    props.isLoading              - Order request in flight
 * @param   {string}                     props.error                  - Order error message (`''` when none)
 * @param   {IAccountsEntity[]}          props.paymentAccounts        - Payment accounts offered for these orders
 * @param   {string}                     props.paymentAccount         - Identifier of the chosen payment account
 * @param   {(id: string) => void}       props.onSelectPaymentAccount - Choose a payment account
 * @param   {() => void}                 props.onReset                - Reset the whole wizard
 * @returns {JSX.Element}                                             Booking summary card
 */
const BookingSummary = ({
  flow,
  salon,
  service,
  master,
  masterAny,
  date,
  time,
  currentIdx,
  totalSteps,
  paymentAccounts,
  paymentAccount,
  onSelectPaymentAccount,
  onBook,
  isLoggedIn,
  isLoading,
  error,
  onReset,
}: {
  flow: BookingFlow | null;
  salon?: BookingSalon | undefined;
  service?: BookingService | undefined;
  master?: BookingMaster | undefined;
  masterAny: boolean;
  date: string;
  time: string;
  currentIdx: number;
  totalSteps: number;
  paymentAccounts: IAccountsEntity[];
  paymentAccount: string;
  onSelectPaymentAccount: (identifier: string) => void;
  onBook: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string;
  onReset: () => void;
}): JSX.Element => {
  const hasAny = Boolean(salon || service || master || masterAny || date);

  /**
   * Format a `y-m-d` date key as `1 January, 2026`.
   * @param   {string} d - Date key
   * @returns {string}   Human date
   */
  const formatDate = (d: string): string => {
    if (!d) return '';
    const [y, m, day] = d.split('-').map(Number);
    return `${day} ${MONTHS[m ?? 0]}, ${y}`;
  };

  const onLastStep = currentIdx === totalSteps - 1;
  const ready = Boolean(flow && onLastStep && time);
  const stepsRemaining = Math.max(0, totalSteps - 1 - currentIdx);

  return (
    <div
      data-testid="booking-summary"
      className="flex flex-col overflow-hidden rounded-3xl shadow-[0_10px_34px_rgba(0,0,0,0.22)] md:h-full md:shadow-[0_4px_40px_rgba(237,33,241,0.08)]"
    >
      <div
        className="p-6 md:p-8"
        style={{ background: `linear-gradient(135deg,${PINK2}dd,${PINK}cc)` }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-white uppercase opacity-80">
            Booking Summary
          </p>
          {flow && (
            <button
              onClick={onReset}
              className="rounded-full border border-white/70 px-3.5 py-1.5 text-sm font-bold tracking-wider text-white uppercase opacity-90 hover:opacity-100 md:rounded-none md:border-0 md:p-0 md:opacity-80"
            >
              Reset
            </button>
          )}
        </div>
        <p className="mt-1 text-2xl font-bold text-white">Your Appointment</p>
        {flow && (
          <p
            data-testid="booking-summary-flow"
            className="mt-1 hidden text-sm tracking-widest text-white/80 uppercase md:block"
          >
            {flow === 'specialist-first'
              ? 'Choose-a-specialist flow'
              : 'Studio-first flow'}
          </p>
        )}
      </div>
      <div className="flex flex-col space-y-4 bg-white p-6 md:flex-1 md:p-8">
        {!flow && (
          <p
            className="flex flex-1 items-center justify-center text-center text-base"
            style={{ color: MUTED }}
          >
            Choose how to start to see your booking details
          </p>
        )}
        {flow && !hasAny && (
          <p className="py-6 text-center text-base" style={{ color: MUTED }}>
            Complete the steps to see your booking details
          </p>
        )}
        {salon && (
          <SummaryRow
            icon={<MapPin size={15} />}
            label="Studio"
            value={salon.name}
            sub={salon.address}
          />
        )}
        {service && (
          <SummaryRow
            icon={<Scissors size={15} />}
            label="Service"
            value={service.name}
            sub={
              <>
                {service.duration && <>{service.duration} · </>}
                <Price amount={service.price} currency={service.currency} />
              </>
            }
          />
        )}
        {master && <MasterSummaryCard master={master} />}
        {masterAny && !master && (
          <SummaryRow
            icon={<User size={15} />}
            label="Specialist"
            value="Any specialist"
            sub="Best available match"
          />
        )}
        {date && (
          <SummaryRow
            icon={<Calendar size={15} />}
            label="Date"
            value={formatDate(date)}
            sub={time ? `at ${time}` : 'Time not selected'}
          />
        )}
        {service && service.price !== null && (
          <div className="border-t pt-4" style={{ borderColor: '#e8e8f0' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: MUTED }}>
                Total
              </span>
              <span
                className="text-xl font-bold whitespace-nowrap"
                style={{ color: DARK }}
              >
                <Price amount={service.price} currency={service.currency} />
              </span>
            </div>
          </div>
        )}
        {/* Payment — only once the client is signed in and the salon offers a
            real choice; PaymentMethodPicker renders nothing for a single one. */}
        {flow && isLoggedIn && (
          <PaymentMethodPicker
            accounts={paymentAccounts}
            value={paymentAccount}
            onSelect={onSelectPaymentAccount}
          />
        )}
        {flow && (
          <div className="pt-2 md:mt-auto">
            {/* Helper text ABOVE the button so the button itself sits flush
                at the bottom — aligning with the Continue button on the left */}
            {!ready && stepsRemaining > 0 && (
              <p className="mb-2 text-center text-sm" style={{ color: MUTED }}>
                {stepsRemaining} more step{stepsRemaining > 1 ? 's' : ''} to
                complete
              </p>
            )}
            {error && (
              <p className="mb-2 text-center text-sm text-red-500">{error}</p>
            )}
            <button
              onClick={onBook}
              disabled={!ready || isLoading}
              data-testid="booking-confirm"
              className="w-full rounded-xl py-3.5 text-base font-bold tracking-wider uppercase transition-all enabled:hover:scale-102 enabled:active:scale-98"
              style={{
                background: ready ? BRAND_GRADIENT : '#f7f7fb',
                color: ready ? '#fff' : MUTED,
                boxShadow: ready ? `0 8px 24px ${PINK}44` : 'none',
                cursor: ready && !isLoading ? 'pointer' : 'not-allowed',
              }}
            >
              {isLoading
                ? 'Booking…'
                : ready
                  ? isLoggedIn
                    ? 'Book Appointment'
                    : 'Sign in to book'
                  : `Step ${currentIdx + 1} of ${totalSteps}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
