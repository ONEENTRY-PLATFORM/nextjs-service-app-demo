import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { entityLinks, entityProductIds } from '@/app/utils/entityLinks';
import { offerAccentGradientsData } from '@/components/data/offerAccentGradientsData';
import { offerCategoryAccentsData } from '@/components/data/offerCategoryAccentsData';

/** Accent used when the CMS carries neither a hex nor a known category. */
const DEFAULT_ACCENT = '#ed21f1';

/** The part of an offer view-model that every offer card shares. */
export interface OfferBase {
  /** Description (`offer_description`, falls back to `plainValue`) */
  description: string;
  /** Bundled service titles (`offer_services`) */
  services: string[];
  /** Current price (`offer_sale`, falls back to `product.price`) */
  price: number;
  /** Crossed-out original price (`offer_price`, `0` hides it) */
  original: number;
  /** Discount percent (`0` hides the ribbon/badge) */
  discount: number;
  /** Accent colour hex from `offer_type` (per-category fallback) */
  accentColor: string;
  /** `linear-gradient` built from the accent colour */
  accentGrad: string;
  /** Product ids of the bundled services — what "Book Offer" preselects */
  serviceProductIds: number[];
}

/**
 * parseOfferBase — read everything the home-page offer card and the offers-page
 * detail card parse identically out of a CMS `offer` product: description,
 * bundled services, pricing with its discount, and the accent colour with its
 * gradient.
 *
 * The two callers keep their own files and view-model types — they differ in the
 * "(featured)" flag, the photo and the duration pill — but the shared arithmetic
 * lives here so a pricing fix cannot land on the home page and miss `/offers`.
 * @param   {IProductsEntity} product - Product entity representing the special offer
 * @returns {OfferBase}               The shared part of the offer view-model
 */
export const parseOfferBase = (product: IProductsEntity): OfferBase => {
  /** `offer_description` is a plain `string` attribute; `plainValue` is a fallback */
  const attrDescription = product.attributeValues?.offer_description?.value;
  const description =
    typeof attrDescription === 'string' && attrDescription
      ? attrDescription
      : ((product.localizeInfos?.plainValue as string | undefined) ?? '');

  /** `offer_services` — entity links to the bundled service products */
  const rawServices = product.attributeValues?.offer_services?.value;
  const services = entityLinks(rawServices)
    .map((link) => link.title)
    .filter(Boolean);

  /** `offer_sale` = current price, `offer_price` = crossed-out original (real → strings) */
  const price =
    Number(product.attributeValues?.offer_sale?.value) || product.price || 0;
  const original = Number(product.attributeValues?.offer_price?.value) || 0;
  const discount =
    original > price && price > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;

  /**
   * `offer_type` list value is the accent-colour hex (`#109AA9`). Falls back to
   * a per-category colour while it is still a category entity, then to pink.
   */
  const offerType = (
    product.attributeValues?.offer_type?.value as
      | Array<{
          title?: string;
          value?: unknown;
          extended?: { value?: string };
        }>
      | undefined
  )?.[0];
  const accentColor =
    [offerType?.value, offerType?.title, offerType?.extended?.value].find(
      (candidate): candidate is string =>
        typeof candidate === 'string' &&
        /^#([0-9a-f]{3}){1,2}$/i.test(candidate),
    ) ||
    (typeof offerType?.title === 'string'
      ? offerCategoryAccentsData[offerType.title]
      : '') ||
    DEFAULT_ACCENT;
  const accentGrad =
    offerAccentGradientsData[accentColor.toLowerCase()] ??
    `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`;

  return {
    description,
    services,
    price,
    original,
    discount,
    accentColor,
    accentGrad,
    serviceProductIds: entityProductIds(rawServices),
  };
};
