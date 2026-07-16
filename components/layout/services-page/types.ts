/**
 * Plain serializable data shapes for the services page catalog. Built on the
 * server from OneEntry entities (pages + products) and passed into the client
 * catalog component, so they must stay JSON-safe (no class instances/dates).
 */

/** A salon location — a child page of `salons` in the CMS. */
export interface ServicesSalon {
  /** CMS `pageUrl` marker of the salon page */
  url: string;
  /** Salon display name */
  title: string;
  /** Street address from the `salon_address` attribute (may be empty) */
  address: string;
}

/** A service subcategory — a grandchild page of `services` in the CMS. */
export interface ServicesSubcategory {
  /** CMS `pageUrl` marker */
  url: string;
  /** Display name */
  title: string;
}

/** A top-level service category — a child page of `services` in the CMS. */
export interface ServicesCategory {
  /** CMS `pageUrl` marker */
  url: string;
  /** Numeric page id — used as `serviceId` for the booking cart */
  id: number;
  /** Display name */
  title: string;
  /** Child subcategories (may be empty while the CMS tree is flat) */
  subcategories: ServicesSubcategory[];
}

/** A single bookable service — a plain (non-offer) product in the CMS. */
export interface ServiceItem {
  /** Product id */
  id: number;
  /** Service name */
  title: string;
  /** Short description (may be empty) */
  description: string;
  /** Price in AED, `null` when not set in the CMS ("Not available") */
  price: number | null;
  /**
   * Product status marker from the CMS (e.g. `in_stock`). A service counts as
   * unavailable when this is not the in-stock marker — independent of price.
   */
  statusIdentifier: string;
  /** Duration in minutes, `null` when not set */
  duration: number | null;
  /** `pageUrl` of the category the product belongs to */
  categoryUrl: string;
  /** Numeric id of the category page — `serviceId` for the booking cart */
  categoryId: number;
  /** `pageUrl` of the subcategory, `null` when attached to the category */
  subcategoryUrl: string | null;
}
