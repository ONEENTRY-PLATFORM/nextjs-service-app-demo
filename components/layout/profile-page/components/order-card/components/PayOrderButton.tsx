'use client';

import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useState } from 'react';

import { resolveOrderPaymentUrl } from '@/app/api/utils/resolveOrderPaymentUrl';
import { useDict } from '@/app/store/providers/useDict';
import { formatOrderTotal } from '@/components/layout/profile-page/utils/formatOrderTotal';
import CurrencySymbol from '@/components/shared/CurrencySymbol';
import { dictText } from '@/components/utils/dictText';

/**
 * PayOrderButton — finishes an online payment that never went through.
 *
 * A gateway booking can end up unpaid in every ordinary way: the client closed
 * the Stripe tab, the card was declined, the session expired. The appointment
 * exists either way, so the card offers the checkout again instead of leaving
 * the client with a booking they cannot pay for.
 *
 * The checkout link is resolved on click, not on render: a link fetched while
 * the profile loads would be stale by the time it is used, and every card would
 * cost a payments request even when nobody intends to pay. Leaving for the
 * gateway is a full navigation (`window.location`) — the router only handles
 * in-app routes.
 * @param   {object}               props       - Component props
 * @param   {IOrderByMarkerEntity} props.order - Order awaiting payment
 * @returns {JSX.Element}                      Pay button with its inline error
 */
const PayOrderButton = ({
  order,
}: {
  order: IOrderByMarkerEntity;
}): JSX.Element => {
  const dict = useDict();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const total = formatOrderTotal(order.totalSum);

  /** Resolve the checkout link and hand the client over to the gateway. */
  const handlePay = async (): Promise<void> => {
    setError('');
    setIsLoading(true);

    const { url, error: reason } = await resolveOrderPaymentUrl(order.id);
    if (!url) {
      setError(
        reason ||
          dictText(
            dict,
            'err_open_checkout',
            'Could not open the checkout. Please try again.',
          ),
      );
      setIsLoading(false);
      return;
    }

    /** Keep the spinner up — the tab is leaving the site, not re-rendering. */
    window.location.href = url;
  };

  return (
    <>
      <button
        onClick={handlePay}
        disabled={isLoading}
        type="button"
        data-testid="order-pay"
        className="flex-1 rounded-lg bg-gradient-brand px-3.5 py-2 text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
      >
        {isLoading ? (
          dictText(dict, 'opening_checkout_text', 'Opening checkout…')
        ) : (
          <>
            {dictText(dict, 'pay_text', 'Pay')}
            {total ? (
              <>
                {' '}
                <CurrencySymbol currency={order.currency} />
                {total}
              </>
            ) : null}
          </>
        )}
      </button>
      {error ? (
        <p className="text-sm text-red-500" data-testid="order-pay-error">
          {error}
        </p>
      ) : null}
    </>
  );
};

export default PayOrderButton;
