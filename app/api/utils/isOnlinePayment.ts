import { ONLINE_PAYMENT_ACCOUNTS } from '@/app/store/orderMarkers';

/**
 * Whether an order's payment account redirects the client to an external gateway.
 *
 * Whitelist rather than `!== 'cash'`: a blacklist treats every unknown provider
 * as online, so the first offline account added in the admin panel (bank
 * transfer, gift card) would be pushed through `Payments.createSession` and the
 * client would never see the success screen.
 * @param   {string | undefined} accountIdentifier - `paymentAccountIdentifier` of the order
 * @returns {boolean}                              `true` when the provider needs a payment session
 */
export const isOnlinePayment = (
  accountIdentifier: string | undefined,
): boolean =>
  !!accountIdentifier && ONLINE_PAYMENT_ACCOUNTS.includes(accountIdentifier);
