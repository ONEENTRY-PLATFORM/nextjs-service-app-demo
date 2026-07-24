import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

import { formatUtcDate } from '@/components/layout/profile-page/utils/formatUtcDate';
import { formatUtcTime } from '@/components/layout/profile-page/utils/formatUtcTime';
import { parseOrderInterval } from '@/components/layout/profile-page/utils/parseOrderInterval';

/**
 * OrderDateTime component displays the date and time of an order.
 * It extracts the start time from the order form data and formats it as DD.MM.YYYY and HH:MM.
 * @param   {object}               props       - Component props
 * @param   {IOrderByMarkerEntity} props.order - Order entity containing order details with form data
 * @returns {JSX.Element}                      JSX element displaying formatted date and time
 */
const OrderDateTime = ({
  order,
}: {
  order: IOrderByMarkerEntity; // Order entity containing form data with date/time information
}): JSX.Element => {
  /**
   * Start and end of the visit. The booking wrote the end as start + the total
   * length of every booked service, so it is the finish time of the whole
   * appointment and needs no extra request.
   */
  const { start, end } = parseOrderInterval(order);

  const formattedDate = start ? formatUtcDate(start) : '';
  const formattedTime = start ? formatUtcTime(start) : '';

  /**
   * When the visit's end is known and differs from its start, the whole span is
   * shown ("14:00 – 16:50") so the card says when the client is free again, not
   * only when they are due.
   */
  const formattedSpan =
    start && end && end.getTime() > start.getTime()
      ? `${formattedTime} – ${formatUtcTime(end)}`
      : formattedTime;

  return (
    /** Container for displaying date and time information */
    <div className="flex items-center gap-3 whitespace-nowrap">
      {/* Display formatted date (plain, dark) */}
      <time dateTime={formattedDate} className="text-base text-slate-400">
        {formattedDate}
      </time>
      {/* Display formatted time (accent pink, bold) */}
      <time
        dateTime={formattedTime}
        className="text-base font-bold text-fuchsia-500"
      >
        {formattedSpan}
      </time>
    </div>
  );
};

export default OrderDateTime;
