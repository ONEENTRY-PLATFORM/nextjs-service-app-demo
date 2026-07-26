/**
 * Masters page taxonomy:
 * the main price-list categories used as the top-level filter and the
 * normalized specialist / salon shapes the page renders from.
 *
 * Masters are mapped from CMS admins with `master_name` set (content plan,
 * stage 4).
 */

/** Main service category of the price list (top-level filter) */
export type MastersMainCategory = 'HAIR' | 'FACE' | 'BODY' | 'NAILS';

/** Main category chips, in the mock's order */
export const MASTERS_MAIN_CATS: { id: MastersMainCategory; label: string }[] = [
  { id: 'HAIR', label: 'Hair' },
  { id: 'FACE', label: 'Face' },
  { id: 'BODY', label: 'Body' },
  { id: 'NAILS', label: 'Nails' },
];

/**
 * A single specialist, normalized for the masters page
 * @property {string}                id          - Stable id (CMS admin id or the specialist name for local demo data)
 * @property {string}                name        - Specialist name, e.g. `Sofia Marchetti`
 * @property {string}                role        - Role line, e.g. `Top Stylist · Downtown`
 * @property {string}                section     - Grouping key — specialists of one profession render as one card section
 * @property {MastersMainCategory[]} categories  - Main price-list categories the specialist works in
 * @property {number | null}         salonId     - Page id of the specialist's salon (matches `SalonOption.id`); `null` when unknown
 * @property {number}                rating      - Rating shown in the mobile row list
 * @property {string}                photo       - Portrait URL; `''` when the CMS attribute is empty
 * @property {string}                [photoBlur] - Ready-made LQIP for the portrait (CMS `previewLink`); absent for files uploaded without previews
 * @property {string}                [href]      - Profile link (`/masters/{adminId}`) — absent for local demo specialists
 */
export type MasterItem = {
  id: string;
  name: string;
  role: string;
  section: string;
  categories: MastersMainCategory[];
  salonId: number | null;
  rating: number;
  photo: string;
  photoBlur?: string | undefined;
  href?: string | undefined;
};

/**
 * A salon option of the salon filter
 * @property {number} id      - CMS salon page id
 * @property {string} name    - Salon name, e.g. `Thalia Downtown`
 * @property {string} address - Salon street address, e.g. `Downtown`
 */
export type SalonOption = {
  id: number;
  name: string;
  address: string;
};

/**
 * Derive the section grouping key from a specialist role line — mirrors the
 * mock's profession sections (Hair Stylist / Beauty Therapist / Makeup
 * Artist / Nail Technician).
 * @param   {string} role - Role / short-description line, e.g. `Top Stylist`
 * @returns {string}      Section key, e.g. `hair-stylist`
 */
export const sectionOfRole = (role: string): string => {
  const r = role.toLowerCase();
  if (r.includes('makeup')) return 'makeup-artist';
  if (r.includes('nail')) return 'nail-technician';
  if (r.includes('therapist') || r.includes('beauty')) {
    return 'beauty-therapist';
  }
  if (r.includes('stylist') || r.includes('hair')) return 'hair-stylist';
  return 'specialist';
};
