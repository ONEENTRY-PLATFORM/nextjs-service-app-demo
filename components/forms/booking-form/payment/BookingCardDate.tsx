import dayjs from 'dayjs';
import type { JSX } from 'react';

/**
 * Booking card date/time row.
 * @param   {object}      props      - Component props
 * @param   {Date}        props.date - Selected appointment date
 * @returns {JSX.Element}            Formatted date and time of the booking
 */
const BookingCardDate = ({ date }: { date: Date | undefined }): JSX.Element => {
  /** Format the selected date in YYYY-MM-DD format */
  const selectedDate = dayjs(date).format('YYYY-MM-DD');

  /** Format the selected time in HH:mm format */
  const selectedTime = dayjs(date).format('HH:mm');

  return (
    <div className="relative mb-2 box-border flex w-full shrink-0 flex-row justify-between self-stretch font-medium text-neutral-600">
      {/** Display formatted date with underline style */}
      <time dateTime={selectedDate} className="text-base underline">
        {selectedDate}
      </time>
      {/** Display formatted time in fuchsia color */}
      <time
        dateTime={selectedTime}
        className="mb-1 text-base font-medium text-fuchsia-500"
      >
        {selectedTime}
      </time>
    </div>
  );
};

export default BookingCardDate;
