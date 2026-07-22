/**
 * isPaidOrderError — did `updateOrder` refuse the cancellation because the
 * appointment is already paid?
 *
 * The API answers a cancel attempt on a paid order with plumbing wording
 * ("Can't update the order. Payment sessions 3 could not be canceled — the
 * order may have been paid."). That is the one refusal the guest can still act
 * on: instead of a dead end, the card offers a refund request
 * (`Orders.createRefundRequest`). Every other failure keeps the plain error
 * dialog, so an unknown message never silently turns into a refund offer.
 * @param   {unknown} error - Value thrown by `updateOrder(...).unwrap()`
 * @returns {boolean}       True when the order could not be cancelled because it is paid
 */
export function isPaidOrderError(error: unknown): boolean {
  const raw =
    (error as { message?: string } | undefined)?.message?.trim() ?? '';

  return /paid|payment/i.test(raw);
}
