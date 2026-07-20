import type { IAttributeValue } from 'oneentry/dist/base/utils';

import dayIntervals from './dayIntervals';

/**
 * Closing time of one working day, as minutes since that day's midnight — the
 * end of the LAST interval of the schedule (a 10:00–22:00 studio → `1320`).
 *
 * The Date & Time step uses it as the wall the appointment must fit behind: a
 * visit longer than "closing − slot" cannot be served that day, so such slots
 * are disabled instead of taking a booking that runs past closing.
 *
 * Minutes are measured from the day's UTC midnight rather than read off
 * `getUTCHours`, so an interval that ends after midnight stays greater than
 * `1440` instead of wrapping to a small number and reading as "closes early".
 * @param   {IAttributeValue|undefined} schedule - Raw `timeInterval` attribute (or `undefined`)
 * @param   {string}                    dateKey  - Calendar day key `y-m-d`, month 0-indexed (as `DateTimeStep` emits)
 * @returns {number|null}                        Minutes since midnight of the closing time; `null` when the day has no intervals
 */
const dayCloseMinutes = (
  schedule: IAttributeValue | undefined,
  dateKey: string,
): number | null => {
  const pairs = dayIntervals(schedule, dateKey);
  if (pairs.length === 0) return null;

  const [year = 0, month = 0, day = 1] = dateKey.split('-').map(Number);
  const midnight = Date.UTC(year, month, day);

  return Math.max(
    ...pairs.map(([, end]) => (end.getTime() - midnight) / 60_000),
  );
};

export default dayCloseMinutes;
