/**
 * A salon gallery photo: the full-size source plus the LQIP placeholder shown
 * while it downloads (the CMS `previewLink`, `null` when the file has none).
 * @property {string}        url     - Public URL of the full-size photo
 * @property {string | null} preview - Base64 LQIP blur placeholder shown while the photo loads, or `null`
 */
export type SalonPhoto = {
  url: string;
  preview: string | null;
};

/**
 * Plain serializable data shape for the salon detail page. Built on the server
 * from the CMS salon page (`salon_address`, `salon_phone`, `salon_images`) plus
 * local content (About/highlights copy) and passed into the client page
 * component, so it must stay JSON-safe.
 * @property {string}        name       - Salon display name, e.g. "Thalia Downtown"
 * @property {string}        address    - Street address (`salon_address`)
 * @property {string}        phone      - Display phone (formatted via `formatUaePhone`)
 * @property {string}        tel        - Value of the `tel:` link (digits only)
 * @property {string}        mapSrc     - Google Maps embed URL of the map iframe
 * @property {string}        mapsLink   - External directions link
 * @property {string}        color      - Accent color (hex — used with alpha suffixes in inline styles)
 * @property {string[]}      about      - "About this studio" paragraphs
 * @property {string[]}      highlights - Highlight bullet items
 * @property {SalonPhoto[]}  photos     - The salon's own photos (`salon_images`), with their blur placeholders
 * @property {string | null} hours      - Collapsed opening hours of the CMS `opening_time` week, `null` when the days differ or the block is missing
 */
export type SalonDetail = {
  name: string;
  address: string;
  phone: string;
  tel: string;
  mapSrc: string;
  mapsLink: string;
  color: string;
  about: string[];
  highlights: string[];
  photos: SalonPhoto[];
  hours: string | null;
};
