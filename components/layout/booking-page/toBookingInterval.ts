import totalServiceMinutes from './totalServiceMinutes';
import type { BookingService } from './types';

/**
 * toBookingInterval — turns the wizard's date key and time slot into the
 * appointment interval. Its length is the sum of every chosen service's
 * duration (each service defaults to 60 min when it has none; an empty
 * selection → 60 min).
 *
 * The interval is built in UTC: the appointment is rendered back with `getUTC*`
 * (see `OrderDateTime`), so a picked "14:00" slot must be stored as 14:00Z.
 * Using the browser's local timezone here would shift the stored visit time by
 * the client's offset.
 * @param   {object}           input          - Input
 * @param   {string}           input.date     - Date key of the calendar, `year-monthIndex-day`
 * @param   {string}           input.time     - Time slot `HH:MM`
 * @param   {BookingService[]} input.services - Chosen services, for the length
 * @returns {[Date, Date]}                    Start / end of the appointment
 */
export const toBookingInterval = ({
  date,
  time,
  services,
}: {
  date: string;
  time: string;
  services: BookingService[];
}): [Date, Date] => {
  const [y = 0, m = 0, d = 1] = date.split('-').map(Number);
  const [hh = 0, mm = 0] = time.split(':').map(Number);

  const start = new Date(Date.UTC(y, m, d, hh, mm));
  const minutes = totalServiceMinutes(services) || 60;
  const end = new Date(start.getTime() + minutes * 60_000);

  return [start, end];
};
