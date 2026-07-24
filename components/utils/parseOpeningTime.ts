/** A single opening-hours row: weekday name and its formatted hours. */
export type OpeningHoursRow = { day: string; hours: string };

/** Weekday names indexed by `Date.getUTCDay()` (0 — Sunday). */
const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Shown instead of hours when a weekday group carries no time pair. */
const CLOSED = 'Closed';

/** A single `{hours, minutes}` point of a `timeInterval` time pair. */
type IntervalPoint = { hours?: number; minutes?: number };

/** One weekday entry of a `timeInterval` group. */
type IntervalValue = {
  dates?: unknown;
  times?: unknown;
};

/**
 * Format a `timeInterval` point as `HH:MM`.
 * @param   {IntervalPoint | undefined} point - Time point from the CMS
 * @returns {string}                          Zero-padded `HH:MM`, empty when the point is malformed
 */
const formatPoint = (point: IntervalPoint | undefined): string => {
  if (!point || typeof point.hours !== 'number') {
    return '';
  }
  const minutes = typeof point.minutes === 'number' ? point.minutes : 0;
  return `${String(point.hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Format every time pair of one weekday as `10:00 – 22:00`, joining multiple
 * pairs (a split shift) with a comma.
 * @param   {unknown} times - `times` array of a `timeInterval` weekday entry
 * @returns {string}        Human-readable hours, `Closed` when there are none
 */
const formatTimes = (times: unknown): string => {
  if (!Array.isArray(times)) {
    return CLOSED;
  }
  const pairs = times
    .map((pair) => {
      if (!Array.isArray(pair)) {
        return '';
      }
      const from = formatPoint(pair[0] as IntervalPoint | undefined);
      const to = formatPoint(pair[1] as IntervalPoint | undefined);
      return from && to ? `${from} – ${to}` : '';
    })
    .filter(Boolean);

  return pairs.length > 0 ? pairs.join(', ') : CLOSED;
};

/**
 * Weekday index of a `timeInterval` entry, read from its first date in UTC —
 * the CMS stores each weekday as a midnight-UTC date repeating every week.
 * @param   {unknown}            dates - `dates` array of a weekday entry
 * @returns {number | undefined}       `Date.getUTCDay()` index, `undefined` when unparsable
 */
const weekdayIndex = (dates: unknown): number | undefined => {
  if (!Array.isArray(dates)) {
    return undefined;
  }
  const first = dates[0];
  if (typeof first !== 'string') {
    return undefined;
  }
  const parsed = new Date(first);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.getUTCDay();
};

/**
 * parseOpeningTime — turn the `opening_time` block's `timeInterval` value into
 * Monday-first weekday rows for the footer and the contacts page.
 *
 * The CMS stores one group per weekday, each holding a midnight-UTC date that
 * identifies the day and the `times` pairs of that day. Anything unparsable is
 * skipped, so a half-filled block degrades to the days it does have instead of
 * throwing; an empty result lets callers fall back to the local mock.
 * @param   {unknown}           value - `attributeValues.opening_time.value` from the block
 * @returns {OpeningHoursRow[]}       Weekday rows ordered Monday → Sunday
 */
const parseOpeningTime = (value: unknown): OpeningHoursRow[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  /** Weekday index → hours, so a day repeated across groups collapses to one row. */
  const byWeekday = new Map<number, string>();

  for (const group of value) {
    const entries = (group as { values?: unknown } | null)?.values;
    if (!Array.isArray(entries)) {
      continue;
    }
    for (const entry of entries as IntervalValue[]) {
      const index = weekdayIndex(entry?.dates);
      if (index === undefined || byWeekday.has(index)) {
        continue;
      }
      byWeekday.set(index, formatTimes(entry?.times));
    }
  }

  /** Monday-first order: UTC indices 1…6 then 0 (Sunday). */
  return [1, 2, 3, 4, 5, 6, 0]
    .map((index) => {
      const hours = byWeekday.get(index);
      const day = WEEKDAYS[index];
      return hours === undefined || day === undefined ? null : { day, hours };
    })
    .filter((row): row is OpeningHoursRow => row !== null);
};

export default parseOpeningTime;
