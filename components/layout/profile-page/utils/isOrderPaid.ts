import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';

/**
 * isOrderPaid — has the payment gateway actually confirmed this order?
 *
 * The cancel refusal wording is ambiguous on purpose ("the order **may** have
 * been paid"): the API answers with the same sentence for a genuinely paid
 * order and for an unpaid one whose checkout session merely can't be voided
 * any more (Stripe sessions expire after 24h and an expired session can't be
 * cancelled — verified live on orders #17/#18, 2026-07-28). Only the paid one
 * can be refunded — the refund endpoint answers `404 "You cannot refund
 * uncompleted order"` otherwise — so the refund offer must branch on the
 * gateway's own verdict, `isCompleted`, not on the refusal wording.
 *
 * `false` and `null` (cash orders never settle online) both mean "not paid";
 * only an explicit `true` earns the refund dialog.
 * @param   {IOrderByMarkerEntity | undefined} order - Order as the orders API returns it
 * @returns {boolean}                                True only when the gateway reported the order paid
 */
export function isOrderPaid(
  order: Pick<IOrderByMarkerEntity, 'isCompleted'> | undefined,
): boolean {
  return order?.isCompleted === true;
}
