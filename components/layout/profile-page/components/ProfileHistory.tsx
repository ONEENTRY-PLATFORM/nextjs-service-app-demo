'use client';

import { useSearchParams } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';

import { getAllOrdersByMarker } from '@/app/api';
import { AuthContext } from '@/app/store/providers/AuthContext';

import VisitGroups from './VisitGroups';
import VisitSection from './VisitSection';

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
  /** Get search parameters from the URL */
  const searchParams = useSearchParams();
  /** Get authentication status from context */
  const { isAuth } = useContext(AuthContext);
  /** State to hold all orders (across every status) */
  const [orders, setOrders] = useState<IOrderByMarkerEntity[]>([]);
  /** State to trigger refetching of data (after cancel / save) */
  const [refetch, setRefetch] = useState(false);

  /** Determine current page from search parameters or default to 0 */
  const currentPage = Number(searchParams.get('page')) || 0;
  const pageLimit = 100;

  /** Effect to fetch orders when dependencies change */
  useEffect(() => {
    if (!isAuth) return;

    const fetchOrders = async () => {
      const { isError, error, orders } = await getAllOrdersByMarker({
        marker: 'orders',
        offset: currentPage * pageLimit,
        limit: pageLimit,
      });

      /** Store every order; bucketing by status happens below */
      if (orders && !isError) {
        setOrders(orders);
      } else if (isError) {
        // eslint-disable-next-line no-console
        console.error(error);
      }

      /** Reset refetch state */
      setRefetch(false);
    };

    fetchOrders();
  }, [currentPage, isAuth, refetch]);

  /** Split orders into the three status buckets */
  const buckets = useMemo(
    () => ({
      upcoming: orders.filter((o) => o.statusIdentifier === 'upcoming'),
      completed: orders.filter((o) => o.statusIdentifier === 'completed'),
      canceled: orders.filter((o) => o.statusIdentifier === 'canceled'),
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
