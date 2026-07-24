import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { parseOfferBase } from '@/components/utils/parseOfferBase';

/** The view-model of a full-width offer detail card, parsed from a product. */
export interface OfferDetailView {
  /** Offer name (`title`) */
  name: string;
  /** Description (`offer_description` attribute, falls back to `plainValue`) */
  description: string;
  /** Bundled service titles (`offer_services`) */
  services: string[];
  /** Current price (`offer_sale`, falls back to `product.price`) */
  price: number;
  /** Crossed-out original price (`offer_price`, `0` hides it) */
  original: number;
  /** Discount percent (`0` hides the badge) */
  discount: number;
  /** Accent colour hex from `offer_type` (per-category fallback) */
  accentColor: string;
  /** Accent gradient (known pair or same-colour fallback) */
  accentGrad: string;
  /** Offer photo (`offer_image` attribute, `''` when the CMS has none) */
  image: string;
  /** Appointment duration line (`offer_time`, `''` hides the pill) */
  duration: string;
  /** Product ids of the bundled services — what "Book Offer" preselects */
  serviceProductIds: number[];
}

/**
 * parseOfferDetail — build the {@link OfferDetailView} of a full-width offer
 * card from a CMS `offer` product. Pure: all UI-shaping (accent gradient,
 * duration formatting) lives here.
 *
 * Everything shared with the home-page card comes from `parseOfferBase`; what is
 * added here is the photo and the duration pill, which only the detail card has.
 * @param   {IProductsEntity} product - Product entity representing the special offer
 * @returns {OfferDetailView}         Parsed offer view-model
 */
export const parseOfferDetail = (product: IProductsEntity): OfferDetailView => {
  const base = parseOfferBase(product);
  const name = product.localizeInfos?.title ?? '';

  /**
   * Offer photo: `offer_image` (an `image` attribute — its value is a single
   * file object `{ downloadLink }`, tolerating an array too). Empty when the
   * CMS holds no photo — the card then renders its accent pane without one.
   */
  const imageVal = product.attributeValues?.offer_image?.value as
    { downloadLink?: string } | Array<{ downloadLink?: string }> | undefined;
  const image =
    (Array.isArray(imageVal)
      ? imageVal[0]?.downloadLink
      : imageVal?.downloadLink) ?? '';

  /** Appointment time line: `offer_time` string (e.g. "2 hours") */
  const rawDuration = product.attributeValues?.offer_time?.value;
  const duration =
    typeof rawDuration === 'string' && rawDuration
      ? rawDuration
      : typeof rawDuration === 'number'
        ? `${rawDuration} min`
        : '';

  return { ...base, name, image, duration };
};
