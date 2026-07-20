/**
 * Render a minute count as a human duration line — `90` → `1 h 30 min`,
 * `60` → `1 h`, `30` → `30 min`.
 * @param   {number} minutes - Duration in minutes
 * @returns {string}         Human duration line (`''` for a non-positive count)
 */
const formatMinutes = (minutes: number): string => {
  if (minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export default formatMinutes;
