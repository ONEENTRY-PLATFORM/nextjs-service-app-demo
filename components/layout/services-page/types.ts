/**
 * Plain serializable data shapes for the services page catalog. Built on the
 * server from OneEntry entities (pages + products) and passed into the client
 * catalog component, so they must stay JSON-safe (no class instances/dates).
 */

/**
 * A salon location — a child page of `salons` in the CMS.
 * @property {string} url     - CMS `pageUrl` marker of the salon page
 * @property {number} id      - Numeric salon page id — the `salonId` a "Book" click puts in the cart
 * @property {string} title   - Salon display name
 * @property {string} address - Street address from the `salon_address` attribute (may be empty)
 */
export interface ServicesSalon {
  url: string;
  id: number;
  title: string;
  address: string;
}

/**
 * A service subcategory — a grandchild page of `services` in the CMS.
 * @property {string} url   - CMS `pageUrl` marker
 * @property {string} title - Display name
 */
export interface ServicesSubcategory {
  url: string;
  title: string;
}

/**
 * A top-level service category — a child page of `services` in the CMS.
 * @property {string}                url           - CMS `pageUrl` marker
 * @property {number}                id            - Numeric page id — used as `serviceId` for the booking cart
 * @property {string}                title         - Display name
 * @property {ServicesSubcategory[]} subcategories - Child subcategories (may be empty while the CMS tree is flat)
 */
export interface ServicesCategory {
  url: string;
  id: number;
  title: string;
  subcategories: ServicesSubcategory[];
}

/**
 * A single bookable service — a plain (non-offer) product in the CMS.
 * @property {number}        id               - Product id
 * @property {string}        title            - Service name
 * @property {string}        description      - Short description (may be empty)
 * @property {number | null} price            - Price, `null` when not set in the CMS ("Not available")
 * @property {string}        currency         - Currency code from the CMS `currency` attribute (`'AED'`); `''` when unset
 * @property {string}        statusIdentifier - Product status marker from the CMS (e.g. `in_stock`). A service counts as unavailable when this is not the in-stock marker — independent of price.
 * @property {number | null} duration         - Duration in minutes, `null` when not set
 * @property {string}        categoryUrl      - `pageUrl` of the category the product belongs to
 * @property {number}        categoryId       - Numeric id of the category page — `serviceId` for the booking cart
 * @property {string | null} subcategoryUrl   - `pageUrl` of the subcategory, `null` when attached to the category
 */
export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  statusIdentifier: string;
  duration: number | null;
  categoryUrl: string;
  categoryId: number;
  subcategoryUrl: string | null;
}
