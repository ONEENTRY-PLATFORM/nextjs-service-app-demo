/**
 * Plain serializable data shape for the salon detail page. Built on the server
 * from the CMS salon page (`salon_address`, `salon_phone`) plus local content
 * (photos scanned from `public/`, About/highlights copy) and passed into the
 * client page component, so it must stay JSON-safe.
 */
export type SalonDetail = {
  /** Salon display name, e.g. "Thalia Downtown" */
  name: string;
  /** Street address (`salon_address`) */
  address: string;
  /** Display phone (formatted via `formatUaePhone`) */
  phone: string;
  /** Value of the `tel:` link (digits only) */
  tel: string;
  /** Google Maps embed URL of the map iframe */
  mapSrc: string;
  /** External directions link */
  mapsLink: string;
  /** Accent color (hex — used with alpha suffixes in inline styles) */
  color: string;
  /** "About this studio" paragraphs */
  about: string[];
  /** Highlight bullet items */
  highlights: string[];
  /** Photo URLs for the gallery */
  photos: string[];
};
