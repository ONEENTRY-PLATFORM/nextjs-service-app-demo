import type { BookingMaster } from '@/components/layout/booking-page/types';
import dateKeyOffset from '@/components/layout/booking-page/utils/dateKeyOffset';
import daySlots from '@/components/layout/booking-page/utils/daySlots';

import { isPastSlot } from './isPastSlot';

/** How many days ahead to look for the specialist's nearest free slot. */
const LOOKAHEAD_DAYS = 7;

/**
 * masterNextSlot — the specialist's nearest bookable slot within the coming
 * week (mock master `nextSlot`), for the "next 10:00" line of the modal's
 * specialist cards. Scans the `master_schedule` day by day from today,
 * skipping today's already-passed times.
 *
 * No schedule in the CMS or no slots all week → `''`, and the card simply
 * hides the line — the mock's hardcoded fallback would promise a time nobody
 * confirmed.
 * @param   {BookingMaster} master - Specialist whose schedule to scan
 * @returns {string}               Nearest slot label `HH:MM`, or `''`
 */
export const masterNextSlot = (master: BookingMaster): string => {
  if (!master.schedule) return '';

  for (let offset = 0; offset < LOOKAHEAD_DAYS; offset++) {
    const dateKey = dateKeyOffset(offset);
    const slot = daySlots(master.schedule, dateKey).find(
      (label) => !isPastSlot(label, dateKey),
    );
    if (slot) return slot;
  }
  return '';
};
