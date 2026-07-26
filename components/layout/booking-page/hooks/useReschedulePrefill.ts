'use client';

import { useSearchParams } from 'next/navigation';
import type { IOrderData } from 'oneentry/dist/orders/ordersInterfaces';
import { useContext } from 'react';

import { useGetSingleOrderQuery } from '@/app/api/api/RTKApi';
import {
  ORDER_FIELD_MASTER,
  ORDER_FIELD_SALON,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';

/**
 * The appointment being moved, resolved into wizard preselection ids.
 * @property {number | null} orderId    - Id of the order to move, `null` for a plain (new) booking
 * @property {number | null} salonId    - Salon of the original appointment
 * @property {number | null} masterId   - Specialist of the original appointment
 * @property {number[]}      productIds - EVERY product of the original appointment, not just the first one
 */
export interface ReschedulePrefill {
  orderId: number | null;
  salonId: number | null;
  masterId: number | null;
  productIds: number[];
}

const EMPTY: ReschedulePrefill = {
  orderId: null,
  salonId: null,
  masterId: null,
  productIds: [],
};

/**
 * useReschedulePrefill — reads the `?reschedule={orderId}` query the profile's
 * "Reschedule" button navigates with and resolves that order into preselection
 * ids for the wizard.
 *
 * The order is fetched here rather than carried through the booking cart on
 * purpose: the cart holds a single product, so a bundled appointment would lose
 * every service after the first — and since a reschedule now OVERWRITES the
 * original order, that loss would be permanent. The query string also keeps the
 * intent scoped to this navigation: a cart field would survive the user
 * wandering off to "Book" something else and would silently overwrite the old
 * appointment instead of creating a new one.
 * @returns {ReschedulePrefill} Ids of the appointment being moved (all `null` / empty for a new booking)
 */
export const useReschedulePrefill = (): ReschedulePrefill => {
  const searchParams = useSearchParams();
  const raw = searchParams.get('reschedule');
  const orderId = raw && /^\d+$/.test(raw) ? Number(raw) : null;

  const { isAuth } = useContext(AuthContext);
  const { data: order } = useGetSingleOrderQuery(
    {
      marker: ORDERS_STORAGE_MARKER,
      id: orderId ?? 0,
      /** Read-only call — `SingleOrderProps` shares its shape with the update. */
      body: {} as IOrderData,
    },
    { skip: !orderId || !isAuth },
  );

  if (!orderId) {
    return EMPTY;
  }
  if (!order) {
    /** Still loading — the id alone already marks the flow as a reschedule. */
    return { ...EMPTY, orderId };
  }

  const salonValue = order.formData.find((f) => f.marker === ORDER_FIELD_SALON)
    ?.value as number[] | undefined;
  const masterValue = order.formData.find(
    (f) => f.marker === ORDER_FIELD_MASTER,
  )?.value as (string | number)[] | undefined;
  /** `master` is a `list` field, so its value arrives as a string id */
  const masterId = Number(masterValue?.[0]);

  return {
    orderId,
    salonId: salonValue?.[0] ?? null,
    masterId: Number.isNaN(masterId) || !masterId ? null : masterId,
    productIds: order.products.map((product) => product.id),
  };
};
