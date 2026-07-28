/**
 * Plain serializable view-model of the offer the booking modal is opened for.
 * Both "Book Offer" call sites (the home feed card and the offers-page detail
 * card) already parse these fields out of the CMS product — the modal takes
 * the ready values instead of re-parsing the entity.
 */

/**
 * The offer summary the booking modal renders in its gradient header and the
 * confirmation step (mock `OfferBookingModal.tsx` → `OfferLite`).
 * @property {number}   productId         - CMS product id of the offer itself — the order line the modal posts. The offer's top-level `price` derives from `offer_sale`, so the order's `totalSum` equals the promised package price (posting the bundled services instead would total their full catalog prices).
 * @property {string}   name              - Offer name (without the `(featured)` service flag)
 * @property {string[]} services          - Bundled service titles — the header chips
 * @property {number}   price             - Current package price (`offer_sale`)
 * @property {number}   original          - Crossed-out original price (`0` hides it)
 * @property {string}   currency          - Currency code from the CMS (`'AED'`, `''` = AED)
 * @property {string}   accentColor       - Accent colour hex of the offer (`offer_type`)
 * @property {string}   accentGrad        - Accent gradient of the header and CTA buttons
 * @property {number[]} serviceProductIds - Product ids of the bundled services — drive the specialist filter and the appointment length
 */
export interface OfferBookingInfo {
  productId: number;
  name: string;
  services: string[];
  price: number;
  original: number;
  currency: string;
  accentColor: string;
  accentGrad: string;
  serviceProductIds: number[];
}
