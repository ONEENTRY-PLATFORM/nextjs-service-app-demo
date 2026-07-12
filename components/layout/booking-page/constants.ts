import { anySpecialistPhotosData } from '@/components/data';

import type { BookingFlow, BookingSalon, StepKey } from './types';

/** Brand colors from the static-html mock (`BookingPage.tsx`) */
export const PINK = '#ed21f1';
export const PINK2 = '#f60efb';
export const CYAN = '#109AA9';
export const DARK = '#4c4d56';
export const MUTED = '#a8a9b5';

/** Brand gradient of active controls (mock `linear-gradient(135deg,PINK2,PINK)`) */
export const BRAND_GRADIENT = `linear-gradient(135deg,${PINK2},${PINK})`;

/** Step order per flow (mock `BookingPage.tsx` → `FLOWS`) */
export const FLOWS: Record<BookingFlow, StepKey[]> = {
  'salon-first': ['salon', 'service', 'specialist', 'datetime'],
  'specialist-first': ['specialist', 'datetime'],
};

/** Time slots of the Date & Time step (mock `BookingPage.tsx` → `TIMES`) */
export const TIMES = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

/**
 * Demo-only busy slots (mock `BUSY_TIMES`) — shown struck through while the
 * wizard runs on demo data; with real CMS data every slot stays bookable.
 */
export const DEMO_BUSY_TIMES = ['09:00', '11:00', '13:00', '17:00', '18:00'];

/** Weekday headers of the calendar, Monday first (mock `DAYS`) */
export const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Month names of the calendar header (mock `MONTHS`) */
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Canonical order of the service category pills (mock `SERVICE_CATEGORIES`) */
export const CATEGORY_ORDER = ['Hair', 'Face', 'Body', 'Nails'];

/** Sentinel id of the "Any specialist" card (mock `__any__`) */
export const ANY_MASTER = '__any__';

/** Fixed 3-line description clamp height of specialist cards (mock `DESC_MIN_H`) */
export const DESC_MIN_H = '4.4em';

/**
 * "Any specialist" team photo for the chosen salon (mock `anySpecialistImg`).
 * CMS salons are matched by a keyword in the salon name; unknown names fall
 * back to the Downtown group photo.
 * @param   {BookingSalon | undefined} salon - The chosen salon (if any)
 * @returns {string}                         Team photo URL
 */
export const anySpecialistImg = (salon?: BookingSalon | undefined): string => {
  const name = salon?.name.toLowerCase() ?? '';
  if (name.includes('marina')) return anySpecialistPhotosData.marina;
  if (name.includes('jbr')) return anySpecialistPhotosData.jbr;
  return anySpecialistPhotosData.downtown;
};
