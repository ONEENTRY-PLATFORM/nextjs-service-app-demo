/**
 * Parse an `HH:MM` slot label into minutes since midnight (`"14:30"` → `870`).
 * @param   {string} slot - Slot label `HH:MM`
 * @returns {number}      Minutes since midnight (`0` for a malformed label)
 */
const slotMinutes = (slot: string): number => {
  const [hh = 0, mm = 0] = slot.split(':').map(Number);
  return (Number.isNaN(hh) ? 0 : hh) * 60 + (Number.isNaN(mm) ? 0 : mm);
};

export default slotMinutes;
