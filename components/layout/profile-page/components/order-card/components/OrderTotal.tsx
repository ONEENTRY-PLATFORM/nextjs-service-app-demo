import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { formatOrderTotal } from '@/components/layout/profile-page/utils/formatOrderTotal';
import CurrencySymbol from '@/components/shared/CurrencySymbol';

/**
 * OrderTotal — what the visit costs, with the payment method it was booked on.
 *
 * The method sits next to the label rather than in a separate line because it
 * is what explains the amount: "Cash" means it is due at the salon, "Stripe"
 * means it is (or should be) paid online — the case the pay button below picks
 * up. Its localized title comes from the CMS payment account; the raw
 * identifier is the fallback.
 * @param   {object}               props       - Component props
 * @param   {IOrderByMarkerEntity} props.order - Order entity holding the totals
 * @returns {JSX.Element | null}               Total row, or `null` when the API has no amount
 */
const OrderTotal = ({
  order,
}: {
  order: IOrderByMarkerEntity;
}): JSX.Element | null => {
  const dict = useDict();

  const total = formatOrderTotal(order.totalSum);
  if (total === null) {
    return null;
  }

  const method =
    order.paymentAccountLocalizeInfos?.title || order.paymentAccountIdentifier;

  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-x-2"
      data-testid="order-total"
    >
      <span className="text-sm text-neutral-300">
        {(dict?.total_text?.value as string | undefined) || 'Total'}
        {method ? ` · ${method}` : ''}
      </span>
      <span className="text-base font-bold text-slate-400">
        <CurrencySymbol currency={order.currency} />
        {total}
      </span>
    </div>
  );
};

export default OrderTotal;
