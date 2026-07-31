import dateKeyOffset from '@/components/layout/booking-page/utils/dateKeyOffset';
import slotMinutes from '@/components/layout/booking-page/utils/slotMinutes';

/**
 * isPastSlot — whether a slot on the chosen day has already passed. Only today
 * can have past slots; any other day's grid is fully in the future. Local wall
 * clock on purpose — the studio and its clients share one timezone, the same
 * assumption the booking wizard's time grid makes.
 * @param   {string}  slot    - Slot label `HH:MM`
 * @param   {string}  dateKey - Calendar day key `year-monthIndex-day`
 * @returns {boolean}         Whether the slot is in the past
 */
export const isPastSlot = (slot: string, dateKey: string): boolean => {
  if (dateKey !== dateKeyOffset(0)) return false;
  const now = new Date();
  return slotMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
};
