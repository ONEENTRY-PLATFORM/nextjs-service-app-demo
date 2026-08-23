'use client';

import type {
  IAdminEntity,
  IAttributeValues,
  IOrderByMarkerEntity,
} from 'oneentry/types';
import type { JSX } from 'react';
import { useContext, useMemo } from 'react';

import {
  useGetAllOrdersByMarkerQuery,
  useGetProductsByIdsQuery,
} from '@/app/api/api/RTKApi';
import {
  ORDERS_STATUS_CANCELED,
  ORDERS_STATUS_COMPLETED,
  ORDERS_STATUS_UPCOMING,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { parseOrderInterval } from '@/components/layout/profile-page/utils/parseOrderInterval';
import productDurationMinutes from '@/components/utils/productDurationMinutes';

import VisitGroups from './visit-section/VisitGroups';
import VisitHistorySkeleton from './visit-section/VisitHistorySkeleton';
import VisitSection from './visit-section/VisitSection';

/**
 * Visit timestamp of an order, used to order upcoming appointments.
 * Falls back to the creation date when the interval is missing.
 * @param   {IOrderByMarkerEntity} order - Order to read
 * @returns {number}                     Milliseconds since epoch
 */
const visitTime = (order: IOrderByMarkerEntity): number => {
  const { start } = parseOrderInterval(order);
  return start
    ? start.getTime()
    : Date.parse(String(order.createdDate ?? '')) || 0;
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
   *
   * `refetchOnMountOrArgChange` is what makes a fresh booking / reschedule show
   * up on arrival: those happen on `/booking`, where this query has no active
   * subscriber, so the tag invalidation only MARKS the cache — it does not
   * refetch a query nobody is watching. Re-fetching every time the profile
   * mounts (i.e. on the redirect back here) turns that mark into an actual
   * reload instead of the stale list that used to need a manual page refresh.
   */
  const { data: orders = [], isLoading } = useGetAllOrdersByMarkerQuery(
    { marker: ORDERS_STORAGE_MARKER },
    { skip: !isAuth, refetchOnMountOrArgChange: true },
  );

  /**
   * How long each booked service takes. The order entity carries only product
   * titles, so the durations come from the products themselves — fetched once
   * for the WHOLE history through the SDK's batch endpoint (one request for
   * every id on the page) rather than per card, and shared with every
   * `OrderCard` as a lookup.
   */
  const productIds = useMemo(
    () => [...new Set(orders.flatMap((o) => o.products.map((p) => p.id)))],
    [orders],
  );
  const { data: products = [] } = useGetProductsByIdsQuery(
    { items: productIds },
    { skip: !isAuth || productIds.length === 0 },
  );
  const durations = useMemo(() => {
    const map = new Map<number, number>();
    for (const product of products) {
      const minutes = productDurationMinutes(product.attributeValues);
      if (minutes !== null) map.set(product.id, minutes);
    }
    return map;
  }, [products]);

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

  /**
   * First load of the orders storage — render the skeleton instead of three
   * sections with a "0" badge and "No visits yet", which would otherwise read as
   * an empty history for the split second before the request resolves.
   */
  if (isLoading) {
    return <VisitHistorySkeleton />;
  }

  return (
    <div className="w-full divide-y divide-slate-150">
      <div className="pb-4">
        <VisitSection
          title={
            (dict.profile_upcoming_text?.value as string | undefined) ||
            'Upcoming'
          }
          status="upcoming"
          count={buckets.upcoming.length}
          defaultOpen
        >
          <VisitGroups
            orders={buckets.upcoming}
            masters={masters}
            dict={dict}
            durations={durations}
          />
        </VisitSection>
      </div>

      <div className="py-4">
        <VisitSection
          title={
            (dict.profile_completed_text?.value as string | undefined) ||
            'Completed'
          }
          status="completed"
          count={buckets.completed.length}
        >
          <VisitGroups
            orders={buckets.completed}
            masters={masters}
            dict={dict}
            durations={durations}
          />
        </VisitSection>
      </div>

      <div className="pt-4">
        <VisitSection
          title={
            (dict.profile_canceled_text?.value as string | undefined) ||
            'Canceled'
          }
          status="canceled"
          count={buckets.canceled.length}
        >
          <VisitGroups
            orders={buckets.canceled}
            masters={masters}
            dict={dict}
            durations={durations}
          />
        </VisitSection>
      </div>
    </div>
  );
};

export default ProfileHistory;
