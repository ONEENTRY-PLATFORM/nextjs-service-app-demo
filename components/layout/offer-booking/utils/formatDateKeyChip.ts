import { dateKeyToDate } from './dateKeyToDate';

/**
 * formatDateKeyChip — short label of the custom-date chip (mock `fmtChip`):
 * `"5 Aug"`. Fixed `en-GB` rather than the browser locale — the site's UI is
 * English-only (single `en_US` CMS locale), and `en-GB` puts the day first,
 * matching the mock's look.
 * @param   {string} dateKey - Calendar day key `year-monthIndex-day`
 * @returns {string}         Day + short month
 */
export const formatDateKeyChip = (dateKey: string): string =>
  dateKeyToDate(dateKey).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
