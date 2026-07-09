'use client';

import { useSearchParams } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX, Key } from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';

import { getAllOrdersByMarker } from '@/app/api';
import { AuthContext } from '@/app/store/providers/AuthContext';
import OrderCard from '@/components/layout/profile-page/components/order-card';

import MasterCard from './master-card';

interface GroupedOrder {
  master: number;
  orders: IOrderByMarkerEntity[];
}

/**
 * ProfileHistory component displays user's order history grouped by master
 * @param   {object}           props           - Component properties
 * @param   {IAttributeValues} props.dict      - Dictionary containing attribute values for localization
 * @param   {string}           props.eventType - Type of event to filter orders by status
 * @param   {IAdminEntity[]}   props.masters   - Array of admin entities (masters) associated with orders
 * @returns {JSX.Element}                      JSX element displaying order history grouped by masters
 */
const ProfileHistory = ({
  dict,
  eventType,
  masters,
}: {
  dict: IAttributeValues;
  eventType: string;
  masters: IAdminEntity[] | undefined;
}): JSX.Element => {
  /** Get search parameters from the URL */
  const searchParams = useSearchParams();
  /** Get authentication status from context */
  const { isAuth } = useContext(AuthContext);
  /** State to hold orders */
  const [orders, setOrders] = useState<IOrderByMarkerEntity[]>([]);
  /** State to trigger refetching of data */
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

      /** Filter and set orders based on event type if no error */
      if (orders && !isError) {
        setOrders(
          orders.filter((order) => order.statusIdentifier === eventType),
        );
      } else if (isError) {
        // eslint-disable-next-line no-console
        console.error(error);
      }

      /** Reset refetch state */
      setRefetch(false);
    };

    fetchOrders();
  }, [currentPage, eventType, isAuth, refetch]);

  /** Memoized grouped orders data sorted by master ID */
  const ordersData = useMemo(() => {
    /** Group orders by master ID extracted from order form data */
    const groupedData = orders.reduce<Record<number, GroupedOrder>>(
      (acc, order) => {
        const masterField = order.formData.find(
          (field) => field.marker === 'master',
        );
        const masterId = (masterField?.value as number[] | undefined)?.[0] || 0;
        if (!acc[masterId]) {
          acc[masterId] = { master: masterId, orders: [] };
        }
        acc[masterId].orders.push(order);
        return acc;
      },
      {},
    );
    /** Sort grouped data by master ID */
    return Object.values(groupedData).sort((a, b) => a.master - b.master);
  }, [orders]);

  /** Render message if no orders are found */
  if (ordersData.length === 0) {
    return <div className="w-full text-xl">History not found</div>;
  }

  /** render orders table */
  return (
    <div className="w-full">
      {ordersData.map(({ master, orders }, i) => {
        if (!masters) {
          return;
        }
        /** Find master data by matching master ID */
        const masterData = masters.find(
          (m: IAdminEntity) => m.id === Number(master),
        );

        /** Extract attribute values from master data or use empty object as fallback */
        const { attributeValues } = masterData || ({} as IAdminEntity);

        /** Render master card and associated orders */
        return (
          <div
            key={i}
            className="mb-5 flex justify-between gap-5 max-md:max-w-full max-md:flex-wrap"
          >
            <MasterCard attributeValues={attributeValues} />
            <div className="mb-4 flex w-[calc(100%-160px)] flex-col gap-3">
              {orders?.map((order: IOrderByMarkerEntity, i: Key | number) => {
                return (
                  <OrderCard
                    key={i}
                    index={i as number}
                    dict={dict}
                    order={order}
                    master={masterData as IAdminEntity}
                    setRefetch={setRefetch}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileHistory;
