/**
 * formatUtcTime — render a time of day as `HH:MM` in UTC.
 *
 * Same reason as `formatUtcDate`: the booking slots are UTC, so rendering them
 * in the viewer's local zone would show a different hour than the one the client
 * picked in the wizard.
 * @param   {Date}   date - Date to render (must be valid)
 * @returns {string}      Time as `HH:MM`, 24-hour
 */
export const formatUtcTime = (date: Date): string => {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
