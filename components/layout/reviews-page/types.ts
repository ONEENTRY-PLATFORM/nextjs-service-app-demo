import type { MastersMainCategory } from '@/components/layout/masters-page/taxonomy';

/**
 * ReviewView — a customer review ready for rendering.
 *
 * The CMS record (`app/api/server/reviews`) only knows the specialist by admin
 * id, so the salon and the service category are resolved on the server — from
 * the specialist's own `master_salon` / `master_services` links — and travel
 * with the review. That keeps the page's filters a pure function of its data,
 * with no name→salon lookup tables to keep in sync.
 * @property {string}                     id       - Record id
 * @property {string}                     author   - Customer name
 * @property {string}                     master   - Specialist name, as shown on the card
 * @property {number}                     masterId - Specialist admin id
 * @property {number}                     rating   - Star rating, 1–5
 * @property {string}                     date     - Display date, e.g. `12 May 2026`
 * @property {string}                     text     - Review body
 * @property {number | null}              salonId  - Salon page id of the specialist, `null` when unlinked
 * @property {MastersMainCategory | null} category - Main service category of the specialist, `null` when unlinked
 */
export type ReviewView = {
  id: string;
  author: string;
  master: string;
  masterId: number;
  rating: number;
  date: string;
  text: string;
  salonId: number | null;
  category: MastersMainCategory | null;
};
