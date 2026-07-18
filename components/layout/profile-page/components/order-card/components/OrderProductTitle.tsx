import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

/**
 * Displays the title of the first product in an order
 * @param   {object}               props       - Component props
 * @param   {IOrderByMarkerEntity} props.order - The order object containing product information
 * @returns {JSX.Element}                      A paragraph element displaying the title of the first product in the order
 */
const OrderProductTitle = ({
  order,
}: {
  order: IOrderByMarkerEntity;
}): JSX.Element => {
  return (
    <p className="text-base text-slate-400">{order.products[0]?.title || ''}</p>
  );
};

export default OrderProductTitle;
