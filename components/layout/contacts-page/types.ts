/**
 * Normalized salon of the contacts page location cards
 * @property {number} id       - CMS salon page id — the React key of the card
 * @property {string} url      - CMS `pageUrl` — the salon detail route `/salons/{url}`
 * @property {string} name     - Salon display name
 * @property {string} address  - Street address
 * @property {string} phone    - Display phone (formatted)
 * @property {string} tel      - Value of the `tel:` link (digits only)
 * @property {string} mapSrc   - Google Maps embed URL of the map iframe
 * @property {string} mapsLink - External directions link of the "Directions" button
 * @property {string} color    - Card accent color (hex — used with alpha suffixes in inline styles)
 */
export type ContactSalon = {
  id: number;
  url: string;
  name: string;
  address: string;
  phone: string;
  tel: string;
  mapSrc: string;
  mapsLink: string;
  color: string;
};
