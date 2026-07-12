/**
 * Masters page taxonomy ported from the static-html mock (`MastersPage.tsx`):
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

/** A single specialist, normalized for the masters page */
export type MasterItem = {
  /** Stable id (CMS admin id or the specialist name for local demo data) */
  id: string;
  /** Specialist name, e.g. `Sofia Marchetti` */
  name: string;
  /** Role line, e.g. `Top Stylist · Downtown` */
  role: string;
  /** Grouping key — specialists of one profession render as one card section */
  section: string;
  /** Main price-list categories the specialist works in */
  categories: MastersMainCategory[];
  /** Id of the specialist's salon (matches `SalonOption.id`); `''` when unknown */
  salonId: string;
  /** Rating shown in the mobile row list */
  rating: number;
  /** Portrait URL; `''` when the CMS attribute is empty */
  photo: string;
  /** Profile link (`/masters/{adminId}`) — absent for local demo specialists */
  href?: string | undefined;
};

/** A salon option of the salon filter */
export type SalonOption = {
  /** Stable id (CMS salon page id or a slug for local demo data) */
  id: string;
  /** Salon name, e.g. `Thalia Downtown` */
  name: string;
  /** Street address shown under the salon name */
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
