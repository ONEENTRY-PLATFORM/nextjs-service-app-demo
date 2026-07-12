/** Normalized salon of the contacts page location cards */
export type ContactSalon = {
  /** Stable key (CMS page id or the mock's `s1`…`s3`) */
  id: string;
  name: string;
  address: string;
  /** Display phone (formatted) */
  phone: string;
  /** Value of the `tel:` link (digits only) */
  tel: string;
  /** Google Maps embed URL of the map iframe */
  mapSrc: string;
  /** External directions link of the "Directions" button */
  mapsLink: string;
  /** Card accent color (hex — used with alpha suffixes in inline styles) */
  color: string;
};
