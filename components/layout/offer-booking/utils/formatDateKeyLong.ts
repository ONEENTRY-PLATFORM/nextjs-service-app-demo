import { dateKeyToDate } from './dateKeyToDate';

/**
 * formatDateKeyLong — the "When" summary value (mock `fmtLong`):
 * `"Wed, 5 Aug"`. Fixed `en-GB` rather than the browser locale — the site's
 * UI is English-only (single `en_US` CMS locale), and a Russian browser would
 * otherwise render "пн, 27 июл." into an English summary.
 * @param   {string} dateKey - Calendar day key `year-monthIndex-day`
 * @returns {string}         Weekday, day + short month
 */
export const formatDateKeyLong = (dateKey: string): string =>
  dateKeyToDate(dateKey).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
