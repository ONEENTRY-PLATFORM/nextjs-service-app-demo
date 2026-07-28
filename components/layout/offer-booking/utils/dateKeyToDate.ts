/**
 * dateKeyToDate — turn a wizard date key (`year-monthIndex-day`, month
 * 0-based) back into a local `Date` at midnight, for display formatting.
 * @param   {string} dateKey - Calendar day key
 * @returns {Date}           Local midnight of that day
 */
export const dateKeyToDate = (dateKey: string): Date => {
  const [year = 0, month = 0, day = 1] = dateKey.split('-').map(Number);
  return new Date(year, month, day);
};
