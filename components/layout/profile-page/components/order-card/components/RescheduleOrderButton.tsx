'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
} from '@/app/store/reducers/CartSlice';

/**
 * RescheduleOrderButton — the primary action of an upcoming visit, as in the
 * static-html mock (`AccountPage.tsx` → "Reschedule"): it reopens the booking
 * wizard for the SAME specialist, studio and service, so only a new date and
 * time have to be picked.
 *
 * The prefill goes through the booking cart: with both a master and a service
 * known, `useBookingWizard` treats it as a repeat/reschedule and jumps straight
 * to the Date & Time step. The existing appointment is deliberately left alone
 * — the client cancels it themselves once the new slot is confirmed, so a
 * half-finished reschedule never loses the original booking.
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
  const dispatch = useAppDispatch();
  const router = useTransitionRouter();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /**
   * Copy the appointment into the booking cart and open the wizard.
   * Markers are the ones the CMS `order` form declares (`salon`, `master`);
   * both values are plain arrays of ids.
   */
  const rescheduleHandle = () => {
    const salonEntity = orderData.formData.find((f) => f.marker === 'salon');
    const salonId = (salonEntity?.value as number[] | undefined)?.[0];
    const masterEntity = orderData.formData.find((f) => f.marker === 'master');
    /** `master` is a `list` field, so its value arrives as a string id */
    const masterId = Number(
      (masterEntity?.value as (string | number)[] | undefined)?.[0],
    );
    const productId = orderData.products[0]?.id;

    dispatch(
      addServiceToCart({
        id: activeId,
        salonId: salonId ?? null,
        productId: productId ?? null,
        serviceId: null,
        masterId: Number.isNaN(masterId) ? null : masterId,
      }),
    );
    router.push('/booking');
  };

  return (
    <button
      type="button"
      onClick={rescheduleHandle}
      data-testid="order-reschedule"
      className="flex-1 rounded-lg bg-gradient-brand py-2 text-base font-bold text-white transition-all hover:opacity-90"
    >
      {(dict.reschedule_text?.value as string | undefined) || 'Reschedule'}
    </button>
  );
};

export default RescheduleOrderButton;
