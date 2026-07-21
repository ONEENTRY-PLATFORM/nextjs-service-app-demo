/**
 * A salon gallery photo: the full-size source plus the LQIP placeholder shown
 * while it downloads (the CMS `previewLink`, `null` when the file has none).
 */
export type SalonPhoto = {
  /** Public URL of the full-size photo */
  url: string;
  /** Base64 LQIP blur placeholder shown while the photo loads, or `null` */
  preview: string | null;
};

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
  /** Photos of the gallery, with their blur placeholders */
  photos: SalonPhoto[];
};
