/**
 * formatUtcDate — render a date as `DD.MM.YYYY` in UTC.
 *
 * Bookings are stored and compared in UTC, so the profile renders them in UTC
 * too: formatting in the viewer's local zone would move a late-evening
 * appointment to the next day for a client reading it from another timezone.
 * @param   {Date}   date - Date to render (must be valid)
 * @returns {string}      Date as `DD.MM.YYYY`
 */
export const formatUtcDate = (date: Date): string => {
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.${date.getUTCFullYear()}`;
};
