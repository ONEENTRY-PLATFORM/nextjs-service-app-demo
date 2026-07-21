'use client';

import type { IAccountsEntity } from 'oneentry/dist/payments/paymentsInterfaces';
import { useContext, useState } from 'react';

import { usePaymentAccounts } from '@/app/api/hooks/usePaymentAccounts';
import { isOnlinePayment } from '@/app/api/utils/isOnlinePayment';
import { PAYMENT_ACCOUNT_CASH } from '@/app/store/orderMarkers';
import { AuthContext } from '@/app/store/providers/AuthContext';

/** Payment accounts the wizard offers and the one the order will use. */
export interface BookingPaymentState {
  /** Payment accounts the salon offers for these orders (see `usePaymentAccounts`) */
  paymentAccounts: IAccountsEntity[];
  /** Identifier of the payment account the order will use */
  paymentAccount: string;
  /** Choose a payment account */
  selectPaymentAccount: (identifier: string) => void;
}

/**
 * useBookingPayment — resolves which payment account the booking order goes
 * out with: the accounts the salon actually offers plus the client's pick. A
 * single-account salon never sees a picker at all — the choice only appears
 * because more than one account is linked.
 *
 * The default is the OFFLINE account (pay at the salon), not simply the first
 * one the API returns: the design books an appointment without asking about
 * payment at all, so paying on site is the expected path, and `getAccounts`
 * happens to list the online provider first — defaulting to it would send every
 * client who ignores the picker to a payment gateway.
 * @returns {BookingPaymentState} Available accounts, the active one and its setter
 */
export const useBookingPayment = (): BookingPaymentState => {
  const { isAuth } = useContext(AuthContext);
  const { accounts: paymentAccounts } = usePaymentAccounts({ isAuth });
  const [paymentAccount, setPaymentAccount] = useState('');

  const offlineAccount = paymentAccounts.find(
    (account) => !isOnlinePayment(account.identifier),
  );

  return {
    paymentAccounts,
    paymentAccount:
      paymentAccount ||
      offlineAccount?.identifier ||
      paymentAccounts[0]?.identifier ||
      PAYMENT_ACCOUNT_CASH,
    selectPaymentAccount: setPaymentAccount,
  };
};
