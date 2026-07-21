/**
 * Format a date based on locale.
 *
 * This function formats a date into a localized string format using the
 * Intl.DateTimeFormat API. The default format is day-month-year with
 * the month displayed as a short name (e.g., "01-Jan-2023").
 * @param   {object}                 props          - The properties object
 * @param   {number | string | Date} props.fullDate - The date to format as a number, string, or Date object
 * @param   {string}                 props.format   - The locale format to use (default: 'en')
 * @returns {string}                                Formatted date string in day-month-year format
 * @example
 * ```typescript
 * const date = UseDate({ fullDate: new Date(), format: 'en' });
 * console.log(date); // "01-Jan-2023"
 * ```
 */
export const UseDate = ({
  fullDate,
  format = 'en',
}: {
  fullDate: number | string | Date;
  format: string;
}): string => {
  const d = new Date(fullDate);
  const year = new Intl.DateTimeFormat(format, {
    year: 'numeric',
  }).format(d);
  const month = new Intl.DateTimeFormat(format, {
    month: 'short',
  }).format(d);
  const day = new Intl.DateTimeFormat(format, {
    day: '2-digit',
  }).format(d);

  const date = day + '-' + month + '-' + year;

  return date;
};
