'use client';

import type { IAccountsEntity } from 'oneentry/types';

import {
  useGetAccountsQuery,
  useGetOrderStorageByMarkerQuery,
} from '@/app/api/api/RTKApi';
import { ORDERS_STORAGE_MARKER } from '@/app/store/orderMarkers';

/**
 * Payment accounts a client may actually choose from at checkout.
 *
 * Source of truth is the order storage's own `paymentAccountIdentifiers`, not
 * the project-wide account list: an account can exist and be enabled yet not be
 * offered for these orders. When the storage names none, fall back to every
 * enabled account (`getAccounts` already filters `isVisible && isUsed`) — the
 * behaviour the orders rule prescribes.
 *
 * The storage query needs a signed-in user, so it is skipped until then; the
 * account list is public and loads either way.
 * @param   {object}  props        - Hook parameters
 * @param   {boolean} props.isAuth - Whether a user session exists (gates the storage query)
 * @returns {object}               `accounts` to offer and `isLoading`
 */
/**
 * Whether an account can actually take money right now.
 *
 * `isUsed` only means "enabled in the admin panel" — a gateway can be enabled
 * yet have no credentials, and OneEntry reports that separately in
 * `settings.status`. Offering such a method is worse than hiding it: the order
 * gets created and then `createSession` answers `400 "Your payment account is
 * not connected."`, leaving the client with an error and an unpaid order.
 * (Verified against this project's Stripe account, 2026-07-17.)
 *
 * An account in `testMode` is judged by its `testSettings` — that is the
 * configuration it will actually use.
 * @param   {IAccountsEntity} account - Payment account from `Payments.getAccounts`
 * @returns {boolean}                 `true` when the gateway is connected
 */
const isConnected = (account: IAccountsEntity): boolean => {
  const settings = (
    account.testMode ? account.testSettings : account.settings
  ) as { status?: string } | undefined;
  return settings?.status === 'connected';
};

export const usePaymentAccounts = ({
  isAuth,
}: {
  isAuth: boolean;
}): { accounts: IAccountsEntity[]; isLoading: boolean } => {
  const { data: accounts, isLoading: accountsLoading } = useGetAccountsQuery(
    {},
  );
  const { data: storage, isLoading: storageLoading } =
    useGetOrderStorageByMarkerQuery(
      { marker: ORDERS_STORAGE_MARKER },
      { skip: !isAuth },
    );

  const all = accounts ?? [];
  /** `paymentAccountIdentifiers` comes back as `[{ identifier }]`. */
  const linked = (
    (
      storage as
        { paymentAccountIdentifiers?: { identifier?: string }[] } | undefined
    )?.paymentAccountIdentifiers ?? []
  )
    .map((entry) => entry?.identifier)
    .filter((identifier): identifier is string => Boolean(identifier));

  const offered = (
    linked.length
      ? all.filter((account) => linked.includes(account.identifier))
      : all
  ).filter(isConnected);

  return {
    accounts: offered,
    isLoading: accountsLoading || (isAuth && storageLoading),
  };
};
