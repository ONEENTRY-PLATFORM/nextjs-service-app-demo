'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';

import { getAllOrdersByMarker } from '@/app/api';
import {
  ORDERS_STATUS_CANCELED,
  ORDERS_STATUS_COMPLETED,
  ORDERS_STATUS_UPCOMING,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';

import VisitGroups from './VisitGroups';
import VisitSection from './VisitSection';

/** Page size of a single orders request. */
const PAGE_LIMIT = 100;

/**
 * Visit timestamp of an order, used to order upcoming appointments.
 * Falls back to the creation date when the interval is missing.
 * @param   {IOrderByMarkerEntity} order - Order to read
 * @returns {number}                     Milliseconds since epoch
 */
const visitTime = (order: IOrderByMarkerEntity): number => {
  const interval = order.formData?.find((f) => f.marker === 'interval')?.value;
  const start = Array.isArray(interval)
    ? (interval as unknown[]).flat()[0]
    : undefined;
  const parsed = typeof start === 'string' ? Date.parse(start) : NaN;
  return Number.isNaN(parsed)
    ? Date.parse(String(order.createdDate ?? '')) || 0
    : parsed;
};

/**
 * Creation timestamp of an order, used to order past appointments.
 * @param   {IOrderByMarkerEntity} order - Order to read
 * @returns {number}                     Milliseconds since epoch
 */
const createdTime = (order: IOrderByMarkerEntity): number =>
  Date.parse(String(order.createdDate ?? '')) || 0;

/**
 * ProfileHistory displays the user's visit history split into three always-
 * visible collapsible sections (Upcoming / Completed / Canceled). It fetches all
 * orders once and buckets them by status; each bucket is grouped by master.
 * @param   {object}           props           - Component properties
 * @param   {IAttributeValues} props.dict      - Dictionary containing localized strings
 * @param   {IAdminEntity[]}   [props.masters] - Array of master entities associated with orders
 * @returns {JSX.Element}                      JSX element displaying the grouped visit history
 */
const ProfileHistory = ({
  dict,
  masters,
}: {
  dict: IAttributeValues;
  masters: IAdminEntity[] | undefined;
}): JSX.Element => {
  /** Get authentication status from context */
  const { isAuth } = useContext(AuthContext);
  /** State to hold all orders (across every status) */
  const [orders, setOrders] = useState<IOrderByMarkerEntity[]>([]);
  /** State to trigger refetching of data (after cancel / save) */
  const [refetch, setRefetch] = useState(false);

  /** Effect to fetch orders when dependencies change */
  useEffect(() => {
    if (!isAuth) return;
    /** Guard against stale writes if auth flips while paging. */
    let cancelled = false;

    const fetchOrders = async () => {
      /**
       * Page through the storage until every order is loaded: the history is
       * grouped client-side, so stopping at the first page would silently hide
       * older visits once a user passes {@link PAGE_LIMIT} appointments.
       */
      const all: IOrderByMarkerEntity[] = [];
      let offset = 0;

      for (;;) {
        const { isError, error, orders, total } = await getAllOrdersByMarker({
          marker: ORDERS_STORAGE_MARKER,
          offset,
          limit: PAGE_LIMIT,
        });

        if (isError || !orders) {
          if (isError) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
          break;
        }

        all.push(...orders);
        offset += PAGE_LIMIT;

        /** Done once the reported total is covered (or the API ran dry). */
        if (orders.length === 0 || all.length >= total) {
          break;
        }
      }

      if (!cancelled) {
        setOrders(all);
        setRefetch(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [isAuth, refetch]);

  /**
   * Split orders into the three status buckets with an explicit order: the API
   * returns them in its own sequence, so without sorting the groups would shift
   * around between refetches. Upcoming reads soonest-first, past visits newest-first.
   */
  const buckets = useMemo(
    () => ({
      upcoming: orders
        .filter((o) => o.statusIdentifier === ORDERS_STATUS_UPCOMING)
        .sort((a, b) => visitTime(a) - visitTime(b)),
      completed: orders
        .filter((o) => o.statusIdentifier === ORDERS_STATUS_COMPLETED)
        .sort((a, b) => createdTime(b) - createdTime(a)),
      canceled: orders
        .filter((o) => o.statusIdentifier === ORDERS_STATUS_CANCELED)
        .sort((a, b) => createdTime(b) - createdTime(a)),
    }),
    [orders],
  );

  return (
    <div className="w-full divide-y divide-slate-150">
      <div className="pb-4">
        <VisitSection
          title="Upcoming"
          status="upcoming"
          count={buckets.upcoming.length}
          defaultOpen
        >
          <VisitGroups
            orders={buckets.upcoming}
            masters={masters}
            dict={dict}
            setRefetch={setRefetch}
          />
        </VisitSection>
      </div>

      <div className="py-4">
        <VisitSection
          title="Completed"
          status="completed"
          count={buckets.completed.length}
        >
          <VisitGroups
            orders={buckets.completed}
            masters={masters}
            dict={dict}
            setRefetch={setRefetch}
          />
        </VisitSection>
      </div>

      <div className="pt-4">
        <VisitSection
          title="Canceled"
          status="canceled"
          count={buckets.canceled.length}
        >
          <VisitGroups
            orders={buckets.canceled}
            masters={masters}
            dict={dict}
            setRefetch={setRefetch}
          />
        </VisitSection>
      </div>
    </div>
  );
};

export default ProfileHistory;
