/**
 * Plain serializable data shapes for the booking wizard. Built on the server
 * from OneEntry entities (salon pages, products, admins) or from the demo
 * fallback and passed into the client wizard, so they must stay JSON-safe.
 */

import type { IAttributeValue } from 'oneentry/dist/base/utils';

/** A salon location — a child page of `salons` in the CMS. */
export interface BookingSalon {
  /**
   * Salon page id, numeric as the CMS stores it. Stays a number all the way to
   * `buildOrderFormData`, which posts it as an entity ref — those take numeric
   * page ids, so a string here only meant converting back.
   */
  id: number;
  /** Salon display name */
  name: string;
  /** Street address from the `salon_address` attribute */
  address: string;
  /** Phone from `salon_phone`, formatted via `formatUaePhone` (may be empty) */
  phone: string;
  /**
   * Raw `salon_time` timeInterval attribute — the studio's opening hours,
   * expanded per day into booking slots when no specific master is chosen. JSON
   * as it comes from the CMS; `undefined` for demo salons or when unset.
   */
  schedule?: IAttributeValue | undefined;
}

/** A bookable service — a plain (non-offer) product in the CMS. */
export interface BookingService {
  /** Product id as a string (demo: `sv1`…`sv17`) */
  id: string;
  /** Display category of the pills (Hair / Face / Body / Nails) */
  category: string;
  /** Service name */
  name: string;
  /**
   * Human duration line, e.g. `60 min` (may be empty) — DISPLAY ONLY.
   *
   * Never parse this back into a number: the project's canonical formatter
   * (`formatMinutes`) renders 90 as `1 h 30 min`, so any future "let's unify the
   * formatting" change would silently turn a 90-minute visit into a 1-minute
   * one. The slot maths and the order's end time read `durationMinutes`.
   */
  duration: string;
  /**
   * Duration in minutes as the CMS stores it; `null` when the service carries
   * no duration. This is the value the booking arithmetic uses.
   */
  durationMinutes: number | null;
  /** Price, `null` when not set in the CMS */
  price: number | null;
  /** Currency code from the CMS (`'AED'`); `''` when unset or for demo services */
  currency: string;
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
  /** Ready-made LQIP for the portrait (CMS `previewLink`); absent for files uploaded without previews */
  photoBlur?: string | undefined;
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
  /** Page ids of the salons the specialist works at (`master_salon`) */
  salonIds: number[];
  /** Ids of the services the specialist performs (`services` product links) */
  serviceIds: string[];
  /**
   * Raw `master_schedule` timeInterval attribute — the specialist's working
   * hours, expanded per day into booking slots. JSON as it comes from the CMS;
   * `undefined` for demo specialists or when unset.
   */
  schedule?: IAttributeValue | undefined;
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
