'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { IAttributeValues, IOrderByMarkerEntity } from 'oneentry/types';
import type { JSX } from 'react';

/**
 * RescheduleOrderButton — the primary action of an upcoming visit: it reopens the booking
 * wizard for the SAME specialist, studio and services, so only a new date and
 * time have to be picked.
 *
 * The order id travels in the query (`?reschedule={id}`), where
 * `useReschedulePrefill` re-reads the appointment: the wizard preselects it,
 * jumps straight to Date & Time and confirms into an UPDATE of this very order.
 * It is deliberately NOT routed through the booking cart — the cart holds a
 * single product (a bundled visit would silently lose services) and it would
 * outlive this navigation, so a later, unrelated booking could overwrite the
 * appointment. Until the new slot is confirmed the original visit is untouched.
 * @param   {object}               props           - Component props
 * @param   {IAttributeValues}     props.dict      - Dictionary containing localized strings
 * @param   {IOrderByMarkerEntity} props.orderData - Order to reschedule
 * @returns {JSX.Element}                          Reschedule action button
 */
const RescheduleOrderButton = ({
  dict,
  orderData,
}: {
  dict: IAttributeValues;
  orderData: IOrderByMarkerEntity;
}): JSX.Element => {
  const router = useTransitionRouter();

  /** Open the wizard on this appointment. */
  const rescheduleHandle = () => {
    router.push(`/booking?reschedule=${orderData.id}`);
  };

  return (
    <button
      type="button"
      onClick={rescheduleHandle}
      data-testid="order-reschedule"
      className="flex-1 rounded-lg bg-gradient-brand px-3.5 py-2 text-base font-bold text-white transition-all hover:opacity-90"
    >
      {(dict.reschedule_text?.value as string | undefined) || 'Reschedule'}
    </button>
  );
};

export default RescheduleOrderButton;
