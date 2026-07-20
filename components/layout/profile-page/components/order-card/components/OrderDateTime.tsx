import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

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
  /** Find the start time from order form data where marker is 'interval' */
  const intervalField = order.formData.find(
    (el: { marker: string }) => el.marker === 'interval',
  );
  const interval = intervalField?.value as string[][] | undefined;
  const startTime = interval?.[0]?.[0];
  /**
   * End of the visit — the booking wrote it as start + the total length of every
   * booked service, so it is the finish time of the whole appointment and needs
   * no extra request.
   */
  const endTime = interval?.[0]?.[1];

  /** Create a Date object from the start time */
  const date = new Date(startTime ?? '');
  const endDate = endTime ? new Date(endTime) : null;

  /** Extract and format date components with leading zeros */
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Month (1-12) with leading zero
  const day = date.getUTCDate().toString().padStart(2, '0'); // Day of month with leading zero
  const year = date.getUTCFullYear(); // Full year (4 digits)
  const hours = date.getUTCHours().toString().padStart(2, '0'); // Hours with leading zero
  const minutes = date.getUTCMinutes().toString().padStart(2, '0'); // Minutes with leading zero

  /**
   * Format time as HH:MM (24-hour format); when the visit's end is known and
   * differs from its start, the whole span is shown ("14:00 – 16:50") so the
   * card says when the client is free again, not only when they are due.
   */
  const formattedTime = `${hours}:${minutes}`;
  const formattedSpan =
    endDate &&
    !Number.isNaN(endDate.getTime()) &&
    endDate.getTime() > date.getTime()
      ? `${formattedTime} – ${endDate.getUTCHours().toString().padStart(2, '0')}:${endDate
          .getUTCMinutes()
          .toString()
          .padStart(2, '0')}`
      : formattedTime;

  /** Format date as DD.MM.YYYY */
  const formattedDate = `${day}.${month}.${year}`;

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
