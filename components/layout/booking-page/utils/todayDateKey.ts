import dateKeyOffset from './dateKeyOffset';

/**
 * todayDateKey — today as the wizard's date key, `year-monthIndex-day`
 * (the format `DateTimeStep` builds its calendar cells with and
 * `BookingSummary.formatDate` reads back — the month is a 0-based index, not a
 * calendar month). Delegates to {@link dateKeyOffset} so the key grammar has a
 * single source.
 *
 * Local time on purpose: the studio and its clients share one locale (Dubai),
 * so "today" is the browser's day, the same wall clock the schedule and the
 * slot labels use.
 * @returns {string} Date key of the current day
 */
const todayDateKey = (): string => dateKeyOffset(0);

export default todayDateKey;
