'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { IOrderData } from 'oneentry/dist/orders/ordersInterfaces';
import { useContext, useState } from 'react';

import { getApi, isError } from '@/app/api/api/api';
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
} from '@/app/api/api/RTKApi';
import { isOnlinePayment } from '@/app/api/utils/isOnlinePayment';
import { useAppDispatch } from '@/app/store/hooks';
import {
  ORDERS_FORM_IDENTIFIER,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import {
  addServiceToCart,
  removeAllServices,
} from '@/app/store/reducers/CartSlice';
import { toErrorMessage } from '@/app/utils/toErrorMessage';

import type { BookingMaster, BookingSalon, BookingService } from '../types';
import { buildOrderFormData } from '../utils/buildOrderFormData';
import { buildOrderProducts } from '../utils/buildOrderProducts';
import { toBookingInterval } from '../utils/toBookingInterval';

/** Everything the wizard has picked by the time of the confirm click. */
export interface BookingSelection {
  salon?: BookingSalon | undefined;
  /** Chosen services (one appointment can bundle several) */
  services: BookingService[];
  master?: BookingMaster | undefined;
  /** Date key of the calendar, `year-monthIndex-day` */
  date: string;
  /** Time slot `HH:MM` */
  time: string;
}

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
 *
 * A RESCHEDULE (`rescheduleOrderId`, takes a fourth branch: the existing appointment is updated in place — no second order
 * is created and no payment is taken again, since the client already paid (or
 * agreed to pay) for this very visit.
 * @param   {object} props                   - Hook parameters
 * @param   {string} props.paymentAccount    - Identifier of the chosen payment account
 * @param   {number} props.rescheduleOrderId - Order being moved; `null` for a new booking
 * @returns {object}                         `submit`, `booked` flag, `closeSuccess`, `isLoading`, `error`
 */
export const useBookingSubmit = ({
  paymentAccount,
  rescheduleOrderId,
}: {
  paymentAccount: string;
  rescheduleOrderId: number | null;
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
  const [createOrder] = useCreateOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();

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
      /**
       * The cart holds a single service (its "Book" buttons are one-service),
       * so only the first pick is stashed as the reload safety net. The full
       * multi-service selection survives anyway: the sign-in popup keeps the
       * page, so the wizard is still standing behind it with everything picked.
       */
      const firstService = sel.services[0];
      dispatch(
        addServiceToCart({
          salonId: Number(sel.salon?.id) || null,
          productId: firstService?.productId ?? null,
          masterId: sel.master?.adminId ?? null,
        }),
      );
      setComponent('SignInForm');
      setOpen(true);
      return;
    }

    /**
     * Nothing bookable in the selection (all demo services) → there is nothing
     * to post, so just show the confirmation.
     */
    const products = buildOrderProducts(sel.services);
    if (products.length === 0) {
      setRealOrder(false);
      setBooked(true);
      return;
    }

    setIsLoading(true);
    try {
      const formData = buildOrderFormData({
        salon: sel.salon,
        master: sel.master,
        interval: toBookingInterval({
          date: sel.date,
          time: sel.time,
          services: sel.services,
        }),
      });

      /**
       * Reschedule — move the EXISTING appointment instead of booking a second
       * one. The order is re-read first and the update is sent as the whole
       * entity with only `formData` / `products` swapped, the same shape the
       * cancel action posts (verified live, `CancelOrderButton`): a minimal body
       * would drop the fields the server does not merge — status included, which
       * would kick the visit out of "Upcoming".
       *
       * Payment is deliberately skipped: this order already has its payment
       * account and (for online providers) its session, so re-running checkout
       * would charge the client twice for one visit.
       */
      if (rescheduleOrderId) {
        const current = await getApi().Orders.getOrderByMarkerAndId(
          ORDERS_STORAGE_MARKER,
          rescheduleOrderId,
        );
        if (isError(current)) {
          setError(current.message);
          return;
        }
        /**
         * Echo the whole read entity back with only `products` / `formData`
         * swapped to the write shape (see the block comment above). `current` is
         * the read shape (`IOrderByMarkerEntity`) — a superset with read-only
         * fields and different `products` typing — so it alone needs the cast;
         * keeping `products` / `formData` outside it means they are still
         * type-checked against `IOrderData` instead of being silently erased.
         */
        const updateBody: IOrderData = {
          ...(current as unknown as IOrderData),
          products,
          formData,
        };
        await updateOrder({
          marker: ORDERS_STORAGE_MARKER,
          id: rescheduleOrderId,
          body: updateBody,
        }).unwrap();

        dispatch(removeAllServices());
        setRealOrder(true);
        setBooked(true);
        return;
      }

      const body: IOrderData = {
        formIdentifier: ORDERS_FORM_IDENTIFIER,
        paymentAccountIdentifier: paymentAccount,
        products,
        formData,
      };

      /**
       * Going through the RTK mutation rather than the raw SDK call is what
       * refetches the profile's order list on arrival: the `Orders` invalidation
       * is declared on the endpoint, so it cannot be forgotten on a new branch.
       * `unwrap()` rejects with the SDK's own error object, hence the local
       * catch — the outer one would flatten it to a generic message.
       */
      let createdOrder;
      try {
        createdOrder = await createOrder({
          marker: ORDERS_STORAGE_MARKER,
          body,
        }).unwrap();
      } catch (e) {
        setError(isError(e) ? e.message : 'Failed to create the appointment');
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
      setError(toErrorMessage(err));
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
