'use client';

import { useTransitionRouter } from 'next-transition-router';
import { useContext, useState } from 'react';

import { getApi, isError } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import {
  addServiceToCart,
  removeAllServices,
  selectActiveItemId,
} from '@/app/store/reducers/CartSlice';

import type { BookingMaster, BookingSalon, BookingService } from './types';

/** Everything the wizard has picked by the time of the confirm click. */
export interface BookingSelection {
  salon?: BookingSalon | undefined;
  service?: BookingService | undefined;
  master?: BookingMaster | undefined;
  /** Date key of the calendar, `year-monthIndex-day` */
  date: string;
  /** Time slot `HH:MM` */
  time: string;
}

/**
 * Parse the wizard's date key + time slot into the appointment interval.
 * The interval length comes from the service duration (default 60 min).
 * @param   {BookingSelection} sel - Confirmed selection
 * @returns {[Date, Date]}         Start / end of the appointment
 */
const toInterval = (sel: BookingSelection): [Date, Date] => {
  const [y = 0, m = 0, d = 1] = sel.date.split('-').map(Number);
  const [hh = 0, mm = 0] = sel.time.split(':').map(Number);
  const start = new Date(y, m, d, hh, mm);
  const minutes = Number.parseInt(sel.service?.duration ?? '', 10) || 60;
  const end = new Date(start.getTime() + minutes * 60_000);
  return [start, end];
};

/**
 * useBookingSubmit — the confirm logic of the booking wizard.
 *
 * Signed-out clients get their selection stashed into the booking cart and
 * are sent to `/profile` to sign in (the cart survives, so the selection is
 * not lost). Signed-in clients get an appointment created in the `orders`
 * storage with the `order` form and cash payment — the same payload the
 * legacy booking form assembled in `Payment.tsx` (`master` / `order_salon` /
 * `interval` form fields plus the product). Demo selections (no CMS product
 * behind the service) show the success modal without an API call.
 * @returns {object} `submit`, `booked` flag, `closeSuccess`, `isLoading`, `error`
 */
export const useBookingSubmit = (): {
  submit: (sel: BookingSelection) => Promise<void>;
  booked: boolean;
  closeSuccess: () => void;
  isAuth: boolean;
  isLoading: boolean;
  error: string;
} => {
  const router = useTransitionRouter();
  const dispatch = useAppDispatch();
  const { isAuth } = useContext(AuthContext);
  const activeId = useAppSelector(selectActiveItemId);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);
  /** True when the confirmed order was real (CMS) — close leads to profile */
  const [realOrder, setRealOrder] = useState(false);

  /**
   * Confirm the booking (see the hook description for the three branches).
   * @param   {BookingSelection} sel - Everything the wizard has picked
   * @returns {Promise<void>}        Resolves when handled
   */
  const submit = async (sel: BookingSelection): Promise<void> => {
    setError('');

    /** Signed out → stash the selection and go sign in */
    if (!isAuth) {
      dispatch(
        addServiceToCart({
          id: activeId,
          salonId: Number(sel.salon?.id) || null,
          serviceId: sel.service?.categoryId ?? null,
          productId: sel.service?.productId ?? null,
          masterId: sel.master?.adminId ?? null,
        }),
      );
      router.push('/profile');
      return;
    }

    /** Demo data → no CMS entities to book, just show the confirmation */
    if (!sel.service?.productId) {
      setRealOrder(false);
      setBooked(true);
      return;
    }

    setIsLoading(true);
    try {
      const interval = toInterval(sel);
      const formData: { marker: string; type: string; value: unknown }[] = [];
      if (sel.master?.adminId) {
        formData.push({
          marker: 'master',
          type: 'list',
          value: [sel.master.adminId.toString()],
        });
      }
      const salonId = Number(sel.salon?.id);
      if (salonId) {
        formData.push({
          marker: 'order_salon',
          type: 'entity',
          value: [salonId.toString()],
        });
      }
      formData.push({
        marker: 'interval',
        type: 'timeInterval',
        value: [interval],
      });

      const createdOrder = await getApi().Orders.createOrder('orders', {
        formIdentifier: 'order',
        paymentAccountIdentifier: 'cash',
        products: [{ productId: sel.service.productId, quantity: 1 }],
        formData,
      } as unknown as Parameters<
        ReturnType<typeof getApi>['Orders']['createOrder']
      >[1]);

      if (isError(createdOrder)) {
        setError(createdOrder.message);
        return;
      }

      dispatch(removeAllServices());
      setRealOrder(true);
      setBooked(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Close the success modal; a real appointment leads to the profile page
   * (mock `onFinish` → account) while a demo one just closes.
   * @returns {void}
   */
  const closeSuccess = (): void => {
    setBooked(false);
    if (realOrder) {
      router.push('/profile');
    }
  };

  return { submit, booked, closeSuccess, isAuth, isLoading, error };
};
