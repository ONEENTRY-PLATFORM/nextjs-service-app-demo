import { formatOrderCancelError } from './formatOrderCancelError';

/**
 * formatRefundError — turns a failed `createRefundRequest` rejection into copy
 * the guest can act on.
 *
 * The refund dialog is only reached after a refused cancellation whose order
 * the gateway reports as paid (`isOrderPaid` gate in `CancelOrderButton`), so
 * "You cannot refund uncompleted order" should be nearly unreachable — it
 * survives as a safety net for a payment state that changed between the check
 * and the request. There is nothing the guest can do online at that point:
 * the cancellation was already refused, so the advice is the salon, not a
 * retry loop. Everything else reuses the cancellation formatter, which
 * already strips the server's plumbing prefix.
 * @param   {unknown} error - Value thrown by `createRefundRequest(...).unwrap()`
 * @returns {string}        Human-readable reason the refund was not requested
 */
export function formatRefundError(error: unknown): string {
  const raw =
    (error as { message?: string } | undefined)?.message?.trim() ?? '';

  if (/uncompleted order/i.test(raw)) {
    return 'This appointment hasn’t been paid, so there is nothing to refund. Please contact the salon to cancel it.';
  }

  return formatOrderCancelError(error);
}
