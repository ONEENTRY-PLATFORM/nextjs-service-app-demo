import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';

import { ORDER_FIELD_INTERVAL } from '@/app/store/orderMarkers';

/** Start and end of a booked visit; either side is `null` when unusable. */
export interface OrderInterval {
  start: Date | null;
  end: Date | null;
}

/**
 * parseOrderInterval — read the visit span out of an order's `interval` field.
 *
 * This is the only place that knows the wire shape of a `timeInterval` answer.
 * The CMS writes it nested (`[[start, end]]`), but the profile code has always
 * had to tolerate a flat `[start, end]` too, so the parse flattens first instead
 * of indexing `[0][0]` — a flat value used to read as "no visit" at two of the
 * three call sites.
 *
 * Timestamps are returned as `Date`, never as an invalid one: anything that does
 * not parse becomes `null`, so callers can branch on presence instead of
 * repeating a `Number.isNaN(d.getTime())` guard.
 * @param   {IOrderByMarkerEntity} order - Order whose form data holds the interval
 * @returns {OrderInterval}              Start/end of the visit, `null` where unavailable
 */
export const parseOrderInterval = (
  order: IOrderByMarkerEntity | null | undefined,
): OrderInterval => {
  const value = order?.formData?.find(
    (field: { marker: string }) => field.marker === ORDER_FIELD_INTERVAL,
  )?.value;

  const parts = Array.isArray(value) ? (value as unknown[]).flat() : [];

  /**
   * Turn one wire entry into a usable date.
   * @param   {unknown}     raw - Candidate timestamp from the interval
   * @returns {Date | null}     Parsed date, or `null` when unusable
   */
  const toDate = (raw: unknown): Date | null => {
    if (typeof raw !== 'string') {
      return null;
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  return { start: toDate(parts[0]), end: toDate(parts[1]) };
};
