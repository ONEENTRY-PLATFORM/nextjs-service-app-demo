/**
 * dateKeyOffset — the wizard date key (`year-monthIndex-day`, month 0-based)
 * of the day `offset` days after today, in local time. `0` is today, `1`
 * tomorrow. The single place the key grammar is generated — `todayDateKey`
 * and the offer booking modal both delegate here, so the format cannot drift
 * between the two booking surfaces.
 * @param   {number} offset - Days after today
 * @returns {string}        Date key of that day
 */
const dateKeyOffset = (offset: number): string => {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  return `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
};

export default dateKeyOffset;
