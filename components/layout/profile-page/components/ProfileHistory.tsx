'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useContext, useMemo } from 'react';

import { useGetAllOrdersByMarkerQuery } from '@/app/api/api/RTKApi';
import {
  ORDERS_STATUS_CANCELED,
  ORDERS_STATUS_COMPLETED,
  ORDERS_STATUS_UPCOMING,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';

import VisitGroups from './VisitGroups';
import VisitSection from './VisitSection';

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

  /**
   * Orders come from RTK Query, which pages the whole storage inside the
   * endpoint and tags the result `['Orders']`. Cancelling or saving an order
   * runs a mutation that invalidates that tag, so the list refreshes itself —
   * this used to be a manual `useEffect` plus a `refetch` boolean drilled down
   * through VisitGroups → OrderCard → Cancel/SaveOrderButton.
   */
  const { data: orders = [] } = useGetAllOrdersByMarkerQuery(
    { marker: ORDERS_STORAGE_MARKER },
    { skip: !isAuth },
  );

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
          />
        </VisitSection>
      </div>
    </div>
  );
};

export default ProfileHistory;
