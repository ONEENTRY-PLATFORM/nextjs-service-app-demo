import type { IOrdersFormData } from 'oneentry/dist/orders/ordersInterfaces';

import {
  ORDER_FIELD_INTERVAL,
  ORDER_FIELD_MASTER,
  ORDER_FIELD_SALON,
} from '@/app/store/orderMarkers';

import type { BookingMaster, BookingSalon } from './types';

/**
 * buildOrderFormData — the `formData` of a booking order.
 *
 * Markers and types mirror the `order` form's ATTRIBUTE SET, verified by
 * actually posting orders (`.claude/temp/probe-order-fields.mjs`, 2026-07-17):
 * `master` (list), `salon` (entity), `interval` (timeInterval) — and nothing
 * else.
 *
 * They used to be guesses, and one was wrong: the salon went as `order_salon`,
 * a marker the form does not have, so once the form was filled in the admin
 * panel the salon silently stopped reaching the order.
 *
 * ⚠️ Do NOT add `price` / `currency` here, however tempting:
 * `getFormByMarker('order')` lists them as attributes, but the form's attribute
 * set holds only the three above, and `createOrder` rejects the extra markers
 * outright — `400 "form includes an attribute's marker that is not presented in
 * corresponding form's attributes sets"`. The public form listing and the set
 * disagree; the set wins. Verify against a real POST, not the listing, whenever
 * this changes.
 *
 * Master and salon are omitted when unknown ("Any specialist", demo studio)
 * rather than sent empty — the form rejects a blank entity reference.
 * @param   {object}            input          - Input
 * @param   {BookingSalon}      [input.salon]  - Chosen studio
 * @param   {BookingMaster}     [input.master] - Chosen specialist
 * @param   {[Date, Date]}      input.interval - Appointment start / end
 * @returns {IOrdersFormData[]}                Order form fields
 */
export const buildOrderFormData = ({
  salon,
  master,
  interval,
}: {
  salon?: BookingSalon | undefined;
  master?: BookingMaster | undefined;
  interval: [Date, Date];
}): IOrdersFormData[] => {
  const formData: IOrdersFormData[] = [];

  if (master?.adminId) {
    formData.push({
      marker: ORDER_FIELD_MASTER,
      type: 'list',
      value: [master.adminId.toString()],
    });
  }

  const salonId = Number(salon?.id);
  if (salonId) {
    formData.push({
      marker: ORDER_FIELD_SALON,
      type: 'entity',
      /** Entity refs to PAGES take numeric ids, not strings. */
      value: [salonId],
    });
  }

  const [start, end] = interval;
  formData.push({
    marker: ORDER_FIELD_INTERVAL,
    type: 'timeInterval',
    /** Send the interval as explicit ISO strings rather than Date objects. */
    value: [[start.toISOString(), end.toISOString()]],
  });

  return formData;
};
