import type { JSX } from 'react';

interface OrderProduct {
  title: string;
  /** Add other product properties as needed */
}

interface Order {
  products: OrderProduct[];
  /** Add other order properties as needed */
}

/**
 * Displays the title of the first product in an order
 * @param   {object}      props       - Component props
 * @param   {Order}       props.order - The order object containing product information
 * @returns {JSX.Element}             A paragraph element displaying the title of the first product in the order
 */
const OrderProductTitle = ({ order }: { order: Order }): JSX.Element => {
  return (
    <p className="text-base text-slate-400">{order.products[0]?.title || ''}</p>
  );
};

export default OrderProductTitle;
