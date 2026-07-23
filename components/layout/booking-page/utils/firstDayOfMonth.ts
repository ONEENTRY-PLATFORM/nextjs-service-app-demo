/**
 * firstDayOfMonth — weekday index of the 1st of a month, Monday-based
 * (0 = Monday … 6 = Sunday), to line the calendar grid up under Mo–Su headers.
 * @param   {number} year  - Full year
 * @param   {number} month - Month index (0–11)
 * @returns {number}       Weekday index of the 1st
 */
const firstDayOfMonth = (year: number, month: number): number => {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
};

export default firstDayOfMonth;
