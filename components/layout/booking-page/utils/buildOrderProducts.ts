import type { BookingService } from '../types';

/** One line of a booking order. */
export interface OrderProduct {
  productId: number;
  quantity: number;
}

/**
 * buildOrderProducts — the products of a booking order: every chosen service
 * that has a CMS product behind it.
 *
 * Demo services (no `productId`) are dropped, so an all-demo selection yields
 * an empty list — the caller reads that as "nothing to post" and confirms the
 * booking without an API call.
 * @param   {BookingService[]} services - Chosen services
 * @returns {OrderProduct[]}            Order lines, one per bookable service
 */
export const buildOrderProducts = (
  services: BookingService[],
): OrderProduct[] =>
  services
    .filter((sv) => sv.productId)
    .map((sv) => ({ productId: sv.productId as number, quantity: 1 }));
