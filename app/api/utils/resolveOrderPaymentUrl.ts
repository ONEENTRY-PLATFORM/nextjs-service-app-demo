import { getApi, isError } from '@/app/api/api/api';

/** Status of the one payment session a gateway is still waiting on. */
const SESSION_STATUS_WAITING = 'waiting';

/**
 * Checkout link for an order that has not been paid yet.
 *
 * A live session is reused before a new one is created. `order.paymentUrl` is
 * deliberately NOT trusted as the source: it holds the URL of the LAST session,
 * which may well be a cancelled one (order #8 on the test account), and sending
 * a client to a dead Stripe page is worse than a second request. Creating a
 * session unconditionally would work too — the API cancels the previous one —
 * but it churns a session per click, and every extra session is one more thing
 * the cancel flow has to void.
 * @param   {number}                                    orderId - Order to pay for
 * @returns {Promise<{ url?: string; error?: string }>}         Checkout URL, or why there is none
 */
export const resolveOrderPaymentUrl = async (
  orderId: number,
): Promise<{ url?: string; error?: string }> => {
  const sessions = await getApi().Payments.getSessionByOrderId(orderId);

  /** The endpoint answers with an array — a single object is the documented alternative. */
  if (!isError(sessions)) {
    const list = Array.isArray(sessions) ? sessions : [sessions];
    const waiting = list.find(
      (session) =>
        session?.status === SESSION_STATUS_WAITING && session.paymentUrl,
    );
    if (waiting?.paymentUrl) {
      return { url: waiting.paymentUrl };
    }
  }

  const session = await getApi().Payments.createSession(orderId, 'session');
  if (isError(session)) {
    return { error: session.message };
  }
  if (!session.paymentUrl) {
    return { error: 'The payment provider did not return a checkout link' };
  }

  return { url: session.paymentUrl };
};
