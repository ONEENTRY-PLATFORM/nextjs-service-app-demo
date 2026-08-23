import type {
  IAdminEntity,
  IAttributeValues,
  IOrderByMarkerEntity,
} from 'oneentry/types';
import type { JSX } from 'react';

import { ORDER_FIELD_MASTER } from '@/app/store/orderMarkers';
import OrderCard from '@/components/layout/profile-page/components/order-card';

import MasterCard from '../master-card';

/** A group of orders that share the same master. */
interface GroupedOrder {
  master: number;
  orders: IOrderByMarkerEntity[];
}

/**
 * Groups a flat list of orders by the master referenced in each order's form
 * data, sorted by master id for a stable render order.
 * @param   {IOrderByMarkerEntity[]} orders - Orders belonging to a single status bucket
 * @returns {GroupedOrder[]}                Orders grouped by master id
 */
const groupOrdersByMaster = (
  orders: IOrderByMarkerEntity[],
): GroupedOrder[] => {
  const grouped = orders.reduce<Record<number, GroupedOrder>>((acc, order) => {
    const masterField = order.formData.find(
      (field) => field.marker === ORDER_FIELD_MASTER,
    );
    const masterId = (masterField?.value as number[] | undefined)?.[0] || 0;
    if (!acc[masterId]) {
      acc[masterId] = { master: masterId, orders: [] };
    }
    acc[masterId].orders.push(order);
    return acc;
  }, {});
  return Object.values(grouped).sort((a, b) => a.master - b.master);
};

/**
 * VisitGroups renders the body of one visit-history section: the bucket's
 * orders grouped by master (master card on the left, order cards on the right),
 * or a muted empty-state message when the bucket has no orders.
 * @param   {object}                 props           - Component props
 * @param   {IOrderByMarkerEntity[]} props.orders    - Orders in this status bucket
 * @param   {IAdminEntity[]}         [props.masters] - Masters lookup list
 * @param   {IAttributeValues}       props.dict      - Dictionary with localized strings
 * @param   {Map<number, number>}    props.durations - Product id → duration in minutes, for the service lines
 * @returns {JSX.Element}                            Grouped order list or empty state
 */
const VisitGroups = ({
  orders,
  masters,
  dict,
  durations,
}: {
  orders: IOrderByMarkerEntity[];
  masters: IAdminEntity[] | undefined;
  dict: IAttributeValues;
  durations: Map<number, number>;
}): JSX.Element => {
  const groups = groupOrdersByMaster(orders);

  /** Empty state — degrade gracefully when the bucket has no orders. */
  if (groups.length === 0) {
    return (
      <p
        className="py-2 text-sm text-neutral-300"
        data-testid="profile-visits-empty"
      >
        {(dict.no_visits_text?.value as string | undefined) || 'No visits yet'}
      </p>
    );
  }

  return (
    <div className="w-full">
      {groups.map(({ master, orders }, i) => {
        /**
         * Running card index across the whole section: the entrance stagger has
         * to keep counting from group to group, otherwise every master row would
         * restart at zero and all groups would lead in on top of each other.
         */
        const base = groups
          .slice(0, i)
          .reduce((n, group) => n + group.orders.length + 1, 0);
        /** Find the master data by matching master id. */
        const masterData = masters?.find(
          (m: IAdminEntity) => m.id === Number(master),
        );
        /** Extract attribute values from master data or fall back to empty. */
        const { attributeValues } = masterData || ({} as IAdminEntity);

        return (
          <div
            key={i}
            className="mb-5 flex justify-between gap-5 max-md:max-w-full max-md:flex-wrap"
          >
            <MasterCard
              attributeValues={attributeValues}
              index={base}
              {...(masterData ? { masterId: masterData.id } : {})}
            />
            <div className="mb-4 flex w-[calc(100%-160px)] flex-col gap-3 max-md:w-full">
              {orders.map((order: IOrderByMarkerEntity, j: number) => (
                <OrderCard
                  key={j}
                  index={base + j + 1}
                  dict={dict}
                  order={order}
                  master={masterData as IAdminEntity}
                  durations={durations}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VisitGroups;
