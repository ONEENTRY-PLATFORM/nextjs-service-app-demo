import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';

import { ORDERS_STATUS_CANCELED } from '@/app/store/orderMarkers';

import { isOnlinePayment } from './isOnlinePayment';

/**
 * Whether the client still owes money for this appointment through a gateway.
 *
 * Three conditions, all needed: the order went out on an ONLINE account (a
 * `cash` booking is settled at the salon and has nothing to pay online), the
 * gateway has not reported it paid, and the visit is not cancelled — a called
 * off appointment must never offer a checkout link.
 *
 * `isCompleted` is compared against `true` rather than tested for falsiness:
 * live orders carry `null` (cash, never tracked), `undefined` (the create
 * response) and `false` (unpaid stripe) interchangeably — verified on the test
 * account, see `.claude/temp/inspect-order-payment.mjs`.
 * @param   {IOrderByMarkerEntity} order - Order entity from the orders storage
 * @returns {boolean}                    `true` when a payment is still due online
 */
export const isOrderAwaitingPayment = (order: IOrderByMarkerEntity): boolean =>
  isOnlinePayment(order.paymentAccountIdentifier) &&
  order.isCompleted !== true &&
  order.statusIdentifier !== ORDERS_STATUS_CANCELED;
