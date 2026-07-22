/**
 * formatOrderCancelError — turns a failed `updateOrder` rejection into the copy
 * shown in the cancellation error dialog.
 *
 * The API rejects with an `IError` whose `message` is plumbing-flavoured
 * ("Can't update the order. Payment sessions 3 could not be canceled — the
 * order may have been paid."): it names the storage operation, not what the
 * guest sees, and leaves them with no next step. Paid orders — the one case the
 * backend can't undo on its own — get their own sentence pointing at the salon;
 * anything else falls back to the server text with the `updateOrder` prefix
 * stripped, so a message we haven't seen yet still reaches the guest.
 * @param   {unknown} error - Value thrown by `updateOrder(...).unwrap()`
 * @returns {string}        Human-readable reason for the failed cancellation
 */
export function formatOrderCancelError(error: unknown): string {
  const raw =
    (error as { message?: string } | undefined)?.message?.trim() ?? '';

  if (/paid|payment/i.test(raw)) {
    return 'This appointment has already been paid, so it can’t be cancelled online. Please contact the salon — they will cancel it and arrange the refund.';
  }

  /** Drop the "Can't update the order." lead-in — the guest booked a visit, not an order. */
  const withoutPrefix = raw
    .replace(/^can'?t update the order\.\s*/i, '')
    .trim();

  return (
    withoutPrefix ||
    'We couldn’t cancel this appointment. Please try again or contact the salon.'
  );
}
