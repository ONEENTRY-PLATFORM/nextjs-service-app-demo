'use client';

import { Check } from 'lucide-react';
import type { IAccountsEntity } from 'oneentry/dist/payments/paymentsInterfaces';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import { DARK, PINK } from '../constants';

/**
 * PaymentMethodPicker — how the client pays for the appointment.
 *
 * Renders nothing when there is no actual choice: with a single account the
 * caller submits with it automatically, and a one-option picker is just noise.
 * @param   {object}               props          - Component properties
 * @param   {IAccountsEntity[]}    props.accounts - Accounts to offer
 * @param   {string}               props.value    - Identifier of the selected account
 * @param   {(id: string) => void} props.onSelect - Select an account
 * @returns {JSX.Element | null}                  Picker, or `null` when there is nothing to choose
 */
const PaymentMethodPicker = ({
  accounts,
  value,
  onSelect,
}: {
  accounts: IAccountsEntity[];
  value: string;
  onSelect: (identifier: string) => void;
}): JSX.Element | null => {
  const dict = useDict();

  if (accounts.length < 2) {
    return null;
  }

  return (
    <div className="border-t pt-4" style={{ borderColor: '#e8e8f0' }}>
      <p className="mb-2 text-xs font-medium tracking-wider text-neutral-300 uppercase">
        {(dict?.payment_text?.value as string | undefined) || 'Payment'}
      </p>
      <div className="flex flex-wrap gap-2" data-testid="payment-methods">
        {accounts.map((account) => {
          const active = account.identifier === value;
          return (
            <button
              key={account.identifier}
              type="button"
              data-testid="payment-method"
              data-payment-id={account.identifier}
              data-active={active}
              onClick={() => onSelect(account.identifier)}
              className="flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition-colors duration-200"
              style={{
                borderColor: active ? PINK : '#e8e8f0',
                color: active ? PINK : DARK,
                background: active ? `${PINK}0f` : 'transparent',
              }}
            >
              {active && <Check size={13} />}
              {account.localizeInfos?.title || account.identifier}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodPicker;
