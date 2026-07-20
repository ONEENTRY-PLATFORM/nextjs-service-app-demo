import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

import formatMinutes from '@/app/utils/formatMinutes';

/**
 * OrderServiceList — every service the visit was booked for, each with how long
 * it takes. One appointment can bundle several services (the booking wizard is
 * a multi-select), so listing only `products[0]` hid the rest of the visit.
 *
 * Durations are not part of the order entity: they live on the service products
 * and are looked up once for the whole history (see `ProfileHistory`), so a
 * product the CMS has no duration for simply renders without the time part.
 * @param   {object}               props           - Component props
 * @param   {IOrderByMarkerEntity} props.order     - Order entity holding the booked products
 * @param   {Map<number, number>}  props.durations - Product id → duration in minutes
 * @returns {JSX.Element}                          List of booked services
 */
const OrderServiceList = ({
  order,
  durations,
}: {
  order: IOrderByMarkerEntity;
  durations: Map<number, number>;
}): JSX.Element => {
  return (
    <ul className="flex flex-col gap-0.5" data-testid="order-services">
      {order.products.map((product, i) => {
        const minutes = durations.get(product.id);
        return (
          <li
            key={product.id || i}
            className="flex flex-wrap items-baseline gap-x-2"
          >
            <span className="text-base text-slate-400">
              {product.title || ''}
            </span>
            {minutes ? (
              <span className="text-sm text-neutral-300">
                {formatMinutes(minutes)}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default OrderServiceList;
