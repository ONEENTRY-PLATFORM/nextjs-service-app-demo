import type { IAttributeValue } from 'oneentry/types';

import dayIntervals from './dayIntervals';

/**
 * Resolve a `timeInterval` schedule (a master's `master_schedule` or a salon's
 * `salon_time`) into the booking slots of one day, as `HH:MM` labels.
 *
 * Times are read with `getUTC*` on purpose: the schedule stores slots in UTC and
 * `useBookingSubmit` writes the picked slot back with `Date.UTC`, so both ends
 * must stay in the same UTC space or a "10:00" slot would drift by the client's
 * offset.
 * @param   {IAttributeValue|undefined} schedule - Raw `timeInterval` attribute (or `undefined`)
 * @param   {string}                    dateKey  - Calendar day key `y-m-d`, month 0-indexed (as `DateTimeStep` emits)
 * @returns {string[]}                           Sorted, unique `HH:MM` slot labels; `[]` when the day has none
 */
const daySlots = (
  schedule: IAttributeValue | undefined,
  dateKey: string,
): string[] => {
  const labels = dayIntervals(schedule, dateKey).map(([start]) => {
    const hh = String(start.getUTCHours()).padStart(2, '0');
    const mm = String(start.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });

  return [...new Set(labels)].sort();
};

export default daySlots;
