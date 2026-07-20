import type { OpeningHoursRow } from './parseOpeningTime';

/**
 * Collapsed week schedule: the first and last weekday sharing one set of
 * hours. Left unformatted on purpose — the footer renders it as
 * `Monday – Sunday`, the contacts page as `Mon – Sun`.
 */
export type OpeningHoursSummary = { from: string; to: string; hours: string };

/**
 * summarizeOpeningHours — collapse a week whose days all share the same hours
 * into a single first/last weekday pair.
 *
 * Returns `null` when the days differ, so the caller renders the per-day list
 * instead of a summary that cannot represent the schedule.
 * @param   {OpeningHoursRow[]}          rows - Weekday rows, Monday first
 * @returns {OpeningHoursSummary | null}      Collapsed week, or `null` when hours vary
 */
const summarizeOpeningHours = (
  rows: OpeningHoursRow[],
): OpeningHoursSummary | null => {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) {
    return null;
  }
  if (rows.some((row) => row.hours !== first.hours)) {
    return null;
  }

  return { from: first.day, to: last.day, hours: first.hours };
};

export default summarizeOpeningHours;
