'use client';

import { useTransitionRouter } from 'next-transition-router';
import { useContext, useState } from 'react';

import { getApi, isError } from '@/app/api';
import { isOnlinePayment } from '@/app/api/utils/isOnlinePayment';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  ORDERS_FORM_IDENTIFIER,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
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
  /**
   * Build the interval in UTC: the appointment is rendered back with `getUTC*`
   * (see OrderDateTime), so a picked "14:00" slot must be stored as 14:00Z.
   * Using the browser's local timezone here would shift the stored visit time
   * by the client's offset.
   */
  const start = new Date(Date.UTC(y, m, d, hh, mm));
  const minutes = Number.parseInt(sel.service?.duration ?? '', 10) || 60;
  const end = new Date(start.getTime() + minutes * 60_000);
  return [start, end];
};

/**
 * useBookingSubmit — the confirm logic of the booking wizard.
 *
 * Signed-out clients get the sign-in popup right on top of the wizard, so the
 * booking is finished where it was started; the selection is also stashed into
 * the booking cart, which survives a reload or a detour through the sign-up /
 * verification forms. Signing in does NOT book on its own: the payment picker
 * only appears once authenticated, so the client confirms the (now
 * "Book Appointment") button themselves. Signed-in clients get an appointment
 * created in the `orders` storage with the `order` form (`master` / `salon` /
 * `interval` fields plus the product). Demo selections (no CMS product behind
 * the service) show the success modal without an API call.
 *
 * Payment splits the tail: an offline account (pay at the salon) ends on the
 * success modal, an online one creates a payment session and hands the client
 * over to the gateway.
 * @param   {object} props                - Hook parameters
 * @param   {string} props.paymentAccount - Identifier of the chosen payment account
 * @returns {object}                      `submit`, `booked` flag, `closeSuccess`, `isLoading`, `error`
 */
export const useBookingSubmit = ({
  paymentAccount,
}: {
  paymentAccount: string;
}): {
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
  const { setOpen, setComponent } = useContext(OpenDrawerContext);
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

    /**
     * Signed out → stash the selection and open the sign-in popup over the
     * wizard. The stash is the safety net for the paths that DO leave the page
     * (reload, "Create an account" → verification); the popup itself keeps the
     * client here, so on success the wizard is still standing behind it with
     * everything picked and the button flips to "Book Appointment".
     */
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
      setComponent('SignInForm');
      setOpen(true);
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
      const [start, end] = toInterval(sel);
      /**
       * Markers and types mirror the `order` form's ATTRIBUTE SET, verified by
       * actually posting orders (`.claude/temp/probe-order-fields.mjs`,
       * 2026-07-17): `master` (list), `salon` (entity), `interval`
       * (timeInterval) — and nothing else.
       *
       * They used to be guesses, and one was wrong: the salon went as
       * `order_salon`, a marker the form does not have, so once the form was
       * filled in the admin panel the salon silently stopped reaching the order.
       *
       * ⚠️ Do NOT add `price` / `currency` here, however tempting:
       * `getFormByMarker('order')` lists them as attributes, but the form's
       * attribute set holds only the three above, and `createOrder` rejects the
       * extra markers outright — `400 "form includes an attribute's marker that
       * is not presented in corresponding form's attributes sets"`. The public
       * form listing and the set disagree; the set wins. Verify against a real
       * POST, not the listing, whenever this changes.
       */
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
          marker: 'salon',
          type: 'entity',
          /** Entity refs to PAGES take numeric ids, not strings. */
          value: [salonId],
        });
      }
      formData.push({
        marker: 'interval',
        type: 'timeInterval',
        /** Send the interval as explicit ISO strings rather than Date objects. */
        value: [[start.toISOString(), end.toISOString()]],
      });

      const createdOrder = await getApi().Orders.createOrder(
        ORDERS_STORAGE_MARKER,
        {
          formIdentifier: ORDERS_FORM_IDENTIFIER,
          paymentAccountIdentifier: paymentAccount,
          products: [{ productId: sel.service.productId, quantity: 1 }],
          formData,
        } as unknown as Parameters<
          ReturnType<typeof getApi>['Orders']['createOrder']
        >[1],
      );

      if (isError(createdOrder)) {
        setError(createdOrder.message);
        return;
      }

      dispatch(removeAllServices());

      /**
       * Online providers finish payment on the gateway's own host, so the order
       * is created first and the client leaves the site — no success modal.
       * Offline ones (pay at the salon) are done here.
       */
      if (isOnlinePayment(paymentAccount)) {
        const session = await getApi().Payments.createSession(
          createdOrder.id,
          'session',
        );
        if (isError(session)) {
          setError(session.message);
          return;
        }
        if (!session.paymentUrl) {
          setError('Payment session has no paymentUrl');
          return;
        }
        /** Full navigation — `router.push` is for in-app routes only. */
        window.location.href = session.paymentUrl;
        return;
      }

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
