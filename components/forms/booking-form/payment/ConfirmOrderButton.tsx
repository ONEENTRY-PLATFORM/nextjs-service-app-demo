import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IAccountsEntity } from 'oneentry/dist/payments/paymentsInterfaces';
import type { JSX } from 'react';

import { useCreateOrder } from '@/app/api';
import SpinnerLoader from '@/components/shared/SpinnerLoader';

/**
 * ConfirmOrderButton Component.
 * @param   {object}           props         - Component props
 * @param   {IAttributeValues} props.dict    - Dictionary.
 * @param   {IAccountsEntity}  props.account - Account.
 * @param   {boolean}          props.isValid - Is valid.
 * @returns {JSX.Element}                    ConfirmOrderButton.
 */
const ConfirmOrderButton = ({
  dict,
  account,
  isValid,
}: {
  dict: IAttributeValues;
  account: IAccountsEntity;
  isValid: boolean;
}): JSX.Element => {
  /** Custom hook for order creation functionality */
  const { isLoading, onConfirmOrder } = useCreateOrder();
  /** Extract text values from dictionary */
  const { apply_text, pay_with_stripe_text } = dict;

  /** Choose the button title based on payment method */
  const title =
    account.identifier === 'cash'
      ? (apply_text?.value as string | undefined) || 'Apply'
      : (pay_with_stripe_text?.value as string | undefined) ||
        'Pay with Stripe';

  /** Render confirm order button with dynamic title and loading state */
  return (
    <button
      onClick={() => {
        onConfirmOrder();
      }}
      className="relative mt-5 h-12.5 items-center justify-center rounded-card border-fuchsia-500 bg-fuchsia-500 px-8 py-2 text-md font-bold tracking-wide text-white uppercase transition-colors duration-300 hover:bg-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:bg-neutral-300/50 disabled:text-neutral-300 max-md:w-full"
      aria-label={title}
      disabled={!isValid}
    >
      {isLoading ? <SpinnerLoader /> : title}
    </button>
  );
};

export default ConfirmOrderButton;
