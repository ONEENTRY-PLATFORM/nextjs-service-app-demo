/**
 * isPaidOrderError — did `updateOrder` refuse the cancellation on payment
 * grounds?
 *
 * The API answers a cancel attempt with plumbing wording ("Can't update the
 * order. Payment sessions 3 could not be canceled — the order may have been
 * paid."). "May" is literal: the same sentence covers a genuinely paid order
 * and an unpaid one with an expired checkout session, so this detector only
 * selects the payment-shaped refusal — whether the guest is then offered a
 * refund is decided by the `isOrderPaid` gate in `CancelOrderButton`. Every
 * other failure keeps the plain error dialog, so an unknown message never
 * silently turns into a refund offer.
 * @param   {unknown} error - Value thrown by `updateOrder(...).unwrap()`
 * @returns {boolean}       True when the cancellation was refused on payment grounds
 */
export function isPaidOrderError(error: unknown): boolean {
  const raw =
    (error as { message?: string } | undefined)?.message?.trim() ?? '';

  return /paid|payment/i.test(raw);
}
