/**
 * daysInMonth — number of days in a calendar month.
 * @param   {number} year  - Full year
 * @param   {number} month - Month index (0–11)
 * @returns {number}       Day count
 */
const daysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export default daysInMonth;
