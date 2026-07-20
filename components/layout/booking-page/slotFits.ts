import slotMinutes from './slotMinutes';

/**
 * Whether an appointment started at this slot still ends before the studio
 * closes — the rule behind the disabled tail of the time grid: a 90-minute
 * visit cannot start at 21:00 in a studio that closes at 22:00, it has to start
 * at 20:30 or earlier.
 *
 * Unknown closing time (`null`) or an empty selection (`0` minutes) means there
 * is nothing to check against, so the slot stays pickable.
 * @param   {string}      slot            - Slot label `HH:MM`
 * @param   {number}      durationMinutes - Total length of the appointment
 * @param   {number|null} closeMinutes    - Closing time in minutes since midnight, `null` when unknown
 * @returns {boolean}                     Whether the visit fits before closing
 */
const slotFits = (
  slot: string,
  durationMinutes: number,
  closeMinutes: number | null,
): boolean => {
  if (closeMinutes === null || durationMinutes <= 0) return true;
  return slotMinutes(slot) + durationMinutes <= closeMinutes;
};

export default slotFits;
