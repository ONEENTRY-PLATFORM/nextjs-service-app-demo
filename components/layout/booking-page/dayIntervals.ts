import { expandAttributeTimeIntervals } from 'oneentry';
import type { IAttributeValue } from 'oneentry/dist/base/utils';

/**
 * Materialize a `timeInterval` schedule (a master's `master_schedule` or a
 * salon's `salon_time`) into the `[start, end]` pairs of one day.
 *
 * The schedule from the CMS is a recurrence rule, not a slot list; the SDK's
 * `expandAttributeTimeIntervals` materializes it for a window on demand (the
 * eager `timeIntervals` field was removed in oneentry 1.0.156 for blowing up
 * the cache). The window is a single UTC day — the SDK compares it at day
 * granularity, so `from` and `to` are the same midnight.
 *
 * Kept as its own step because two readers need different halves of the same
 * expansion: `daySlots` takes the starts (the pickable slots) and
 * `dayCloseMinutes` takes the last end (closing time).
 * @param   {IAttributeValue|undefined} schedule - Raw `timeInterval` attribute (or `undefined`)
 * @param   {string}                    dateKey  - Calendar day key `y-m-d`, month 0-indexed (as `DateTimeStep` emits)
 * @returns {[Date, Date][]}                     Expanded pairs of that day; `[]` when the day has none
 */
const dayIntervals = (
  schedule: IAttributeValue | undefined,
  dateKey: string,
): [Date, Date][] => {
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
  return expandAttributeTimeIntervals(schedule, {
    from: utcDay,
    to: utcDay,
  }).map(([start, end]) => [new Date(start), new Date(end)]);
};

export default dayIntervals;
