/**
 * Plain serializable data shapes for the booking wizard. Built on the server
 * from OneEntry entities (salon pages, products, admins) or from the demo
 * fallback and passed into the client wizard, so they must stay JSON-safe.
 */

/** A salon location — a child page of `salons` in the CMS or a demo studio. */
export interface BookingSalon {
  /** Salon page id as a string (demo: `downtown` / `marina` / `jbr`) */
  id: string;
  /** Salon display name */
  name: string;
  /** Street address from the `salon_address` attribute */
  address: string;
  /** Phone from `salon_phone`, formatted via `formatUaePhone` (may be empty) */
  phone: string;
}

/** A bookable service — a plain (non-offer) product in the CMS. */
export interface BookingService {
  /** Product id as a string (demo: `sv1`…`sv17`) */
  id: string;
  /** Display category of the pills (Hair / Face / Body / Nails) */
  category: string;
  /** Service name */
  name: string;
  /** Human duration line, e.g. `60 min` (may be empty) */
  duration: string;
  /** Price in AED, `null` when not set in the CMS */
  price: number | null;
  /** CMS product id for the cart/order, `null` for demo services */
  productId: number | null;
  /** CMS services category page id (`serviceId` of the cart), `null` in demo */
  categoryId: number | null;
}

/** A specialist — a OneEntry admin with `master_*` attributes or a demo one. */
export interface BookingMaster {
  /** Admin id as a string (demo: specialist name) */
  id: string;
  /** CMS admin id for the cart/order, `null` for demo specialists */
  adminId: number | null;
  /** Specialist name (`master_name`) */
  name: string;
  /** Grade badge, e.g. `Top Stylist` (`master_short_description`) */
  grade: string;
  /** Portrait URL (`master_image`), empty string when not set */
  photo: string;
  /** Specialties line of the card, e.g. `['Hair']` */
  specialties: string[];
  /** Rating 1–5 (`master_rating`) */
  rating: number;
  /** Review count shown next to the rating, `null` hides the `(n)` part */
  reviews: number | null;
  /** "from" price in AED, `null` hides the price line */
  price: number | null;
  /** Short bio of the card (`master_description`) */
  bio: string;
  /** Ids of the salons the specialist works at (`master_salon`) */
  salonIds: string[];
  /** Ids of the services the specialist performs (`services` product links) */
  serviceIds: string[];
}

/** All the data the booking wizard needs, assembled on the server. */
export interface BookingData {
  salons: BookingSalon[];
  services: BookingService[];
  masters: BookingMaster[];
}

/** The two entry flows of the wizard (mock `BookingPage.tsx` → `Flow`). */
export type BookingFlow = 'salon-first' | 'specialist-first';

/** Wizard step keys (mock `BookingPage.tsx` → `StepKey`). */
export type StepKey = 'salon' | 'service' | 'specialist' | 'datetime';
