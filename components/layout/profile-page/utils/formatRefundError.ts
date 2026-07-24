import { formatOrderCancelError } from './formatOrderCancelError';

/**
 * formatRefundError — turns a failed `createRefundRequest` rejection into copy
 * the guest can act on.
 *
 * The refund dialog is only reached after the API refuses a cancellation on
 * payment grounds, and that refusal is worded "the order **may** have been
 * paid" — so the order occasionally turns out not to be paid at all, and the
 * refund endpoint answers "You cannot refund uncompleted order". That is not a
 * failure the guest caused: there is simply nothing to refund, and retrying the
 * plain cancellation is the way out. Everything else reuses the cancellation
 * formatter, which already strips the server's plumbing prefix.
 * @param   {unknown} error - Value thrown by `createRefundRequest(...).unwrap()`
 * @returns {string}        Human-readable reason the refund was not requested
 */
export function formatRefundError(error: unknown): string {
  const raw =
    (error as { message?: string } | undefined)?.message?.trim() ?? '';

  if (/uncompleted order/i.test(raw)) {
    return 'This appointment hasn’t been paid, so there is nothing to refund. Please try cancelling it again.';
  }

  return formatOrderCancelError(error);
}
