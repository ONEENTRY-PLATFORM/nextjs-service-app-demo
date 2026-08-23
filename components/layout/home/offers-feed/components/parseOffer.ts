import type { IProductsEntity } from 'oneentry/types';

import { parseOfferBase } from '@/components/utils/parseOfferBase';

/**
 * The view-model of a special-offer card, parsed from a CMS product.
 * @property {string}   name              - Offer name without the "(featured)" flag
 * @property {string}   tagline           - Tagline under the name (`offer_description`, falls back to `plainValue`)
 * @property {boolean}  featured          - Featured card (full accent-gradient background)
 * @property {string[]} services          - Bundled service titles with check marks
 * @property {number}   price             - Current price (`offer_sale`, falls back to `product.price`)
 * @property {number}   original          - Crossed-out original price (`offer_price`, `0` hides it)
 * @property {number}   discount          - Discount percent (`0` hides the ribbon)
 * @property {string}   accentColor       - Accent colour hex from `offer_type` (per-category fallback)
 * @property {string}   accentGrad        - `linear-gradient` built from the accent colour
 * @property {number[]} serviceProductIds - Product ids of the bundled services — what "Book Offer" preselects
 */
export interface OfferView {
  name: string;
  tagline: string;
  featured: boolean;
  services: string[];
  price: number;
  original: number;
  discount: number;
  accentColor: string;
  accentGrad: string;
  serviceProductIds: number[];
}

/**
 * parseOffer — build the {@link OfferView} of a special-offer card from a CMS
 * `offer` product (prefixed markers). Pure: all UI-shaping of the offer data
 * lives here so the card stays a render.
 *
 * Everything shared with the `/offers` detail card (description, services,
 * pricing, accent) comes from `parseOfferBase`; what is added here is the
 * home-page-only "(featured)" flag, which the mock encodes in the title.
 * @param   {IProductsEntity} product - Product entity representing the special offer
 * @returns {OfferView}               Parsed offer view-model
 */
export const parseOffer = (product: IProductsEntity): OfferView => {
  const { description, ...base } = parseOfferBase(product);

  const rawTitle = product.localizeInfos?.title ?? '';
  /** Featured card is flagged by "(featured)" in the title (no `party_star` value) */
  const featured = /\(featured\)/i.test(rawTitle);
  const name = rawTitle.replace(/\s*\(featured\)\s*/i, ' ').trim();

  return { ...base, name, tagline: description, featured };
};
