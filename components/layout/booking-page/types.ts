/**
 * Plain serializable data shapes for the booking wizard. Built on the server
 * from OneEntry entities (salon pages, products, admins) or from the demo
 * fallback and passed into the client wizard, so they must stay JSON-safe.
 */

import type { IAttributeValue } from 'oneentry/types';

/**
 * A salon location — a child page of `salons` in the CMS.
 * @property {number}          id         - Salon page id, numeric as the CMS stores it. Stays a number all the way to `buildOrderFormData`, which posts it as an entity ref — those take numeric page ids, so a string here only meant converting back.
 * @property {string}          name       - Salon display name
 * @property {string}          address    - Street address from the `salon_address` attribute
 * @property {string}          phone      - Phone from `salon_phone`, formatted via `formatUaePhone` (may be empty)
 * @property {IAttributeValue} [schedule] - Raw `salon_time` timeInterval attribute — the studio's opening hours, expanded per day into booking slots when no specific master is chosen. JSON as it comes from the CMS; `undefined` for demo salons or when unset.
 */
export interface BookingSalon {
  id: number;
  name: string;
  address: string;
  phone: string;
  schedule?: IAttributeValue | undefined;
}

/**
 * A bookable service — a plain (non-offer) product in the CMS.
 * @property {string}        id              - Product id as a string (demo: `sv1`…`sv17`)
 * @property {string}        category        - Display category of the pills (Hair / Face / Body / Nails)
 * @property {string}        name            - Service name
 * @property {string}        duration        - Human duration line, e.g. `60 min` (may be empty) — DISPLAY ONLY. Never parse this back into a number: the project's canonical formatter (`formatMinutes`) renders 90 as `1 h 30 min`, so any future "let's unify the formatting" change would silently turn a 90-minute visit into a 1-minute one. The slot maths and the order's end time read `durationMinutes`.
 * @property {number | null} durationMinutes - Duration in minutes as the CMS stores it; `null` when the service carries no duration. This is the value the booking arithmetic uses.
 * @property {number | null} price           - Price, `null` when not set in the CMS
 * @property {string}        currency        - Currency code from the CMS (`'AED'`); `''` when unset or for demo services
 * @property {number | null} productId       - CMS product id for the cart/order, `null` for demo services
 * @property {number | null} categoryId      - CMS services category page id (`serviceId` of the cart), `null` in demo
 */
export interface BookingService {
  id: string;
  category: string;
  name: string;
  duration: string;
  durationMinutes: number | null;
  price: number | null;
  currency: string;
  productId: number | null;
  categoryId: number | null;
}

/**
 * A specialist — a OneEntry admin with `master_*` attributes or a demo one.
 * @property {string}          id          - Admin id as a string (demo: specialist name)
 * @property {number | null}   adminId     - CMS admin id for the cart/order, `null` for demo specialists
 * @property {string}          name        - Specialist name (`master_name`)
 * @property {string}          grade       - Grade badge, e.g. `Top Stylist` (`master_short_description`)
 * @property {string}          photo       - Portrait URL (`master_image`), empty string when not set
 * @property {string}          [photoBlur] - Ready-made LQIP for the portrait (CMS `previewLink`); absent for files uploaded without previews
 * @property {string[]}        specialties - Specialties line of the card, e.g. `['Hair']`
 * @property {number}          rating      - Rating 1–5 (`master_rating`)
 * @property {number | null}   reviews     - Review count shown next to the rating, `null` hides the `(n)` part
 * @property {number | null}   price       - "from" price in AED, `null` hides the price line
 * @property {string}          bio         - Short bio of the card (`master_description`)
 * @property {number[]}        salonIds    - Page ids of the salons the specialist works at (`master_salon`)
 * @property {string[]}        serviceIds  - Ids of the services the specialist performs (`services` product links)
 * @property {IAttributeValue} [schedule]  - Raw `master_schedule` timeInterval attribute — the specialist's working hours, expanded per day into booking slots. JSON as it comes from the CMS; `undefined` for demo specialists or when unset.
 */
export interface BookingMaster {
  id: string;
  adminId: number | null;
  name: string;
  grade: string;
  photo: string;
  photoBlur?: string | undefined;
  specialties: string[];
  rating: number;
  reviews: number | null;
  price: number | null;
  bio: string;
  salonIds: number[];
  serviceIds: string[];
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
