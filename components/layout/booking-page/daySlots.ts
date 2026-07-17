import { expandAttributeTimeIntervals } from 'oneentry';
import type { IAttributeValue } from 'oneentry/dist/base/utils';

/**
 * Resolve a `timeInterval` schedule (a master's `master_schedule` or a salon's
 * `salon_time`) into the booking slots of one day, as `HH:MM` labels.
 *
 * The schedule from the CMS is a recurrence rule, not a slot list; the SDK's
 * `expandAttributeTimeIntervals` materializes it for a window on demand (the
 * eager `timeIntervals` field was removed in oneentry 1.0.156 for blowing up
 * the cache). The window is a single UTC day — the SDK compares it at day
 * granularity, so `from` and `to` are the same midnight.
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
  const parts = dateKey.split('-').map(Number);
  const [year, month, day] = parts;
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    parts.some((n) => Number.isNaN(n))
  ) {
    return [];
  }

  const utcDay = new Date(Date.UTC(year, month, day));
  const pairs = expandAttributeTimeIntervals(schedule, {
    from: utcDay,
    to: utcDay,
  });

  const labels = pairs.map(([start]) => {
    const at = new Date(start);
    const hh = String(at.getUTCHours()).padStart(2, '0');
    const mm = String(at.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });

  return [...new Set(labels)].sort();
};

export default daySlots;
