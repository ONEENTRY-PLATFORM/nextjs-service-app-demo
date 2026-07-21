import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { offerAccentGradientsData } from '@/components/data/offerAccentGradientsData';

/**
 * Brand accent pairs from the static-html mock (`components/data/offerAccentGradientsData.ts`): each
 * known accent color maps to its light→dark gradient. Unknown accents fall
 * back to a same-color gradient like the home page `OfferCard`.
 */
const ACCENT_GRADIENTS: Record<string, string> = offerAccentGradientsData;

/** Per-category accent fallback while `offer_type` is still a category entity */
const CATEGORY_ACCENT: Record<string, string> = {
  Hair: '#ed21f1',
  Face: '#9b4fb2',
  Body: '#109aa9',
  Nails: '#109aa9',
};

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
  /** Category page id of the first bundled service (for the booking cart) */
  firstServiceParentId: number;
}

/**
 * parseOfferDetail — build the {@link OfferDetailView} of a full-width offer
 * card from a CMS `offer` product. Pure: all UI-shaping (accent gradient,
 * duration formatting) lives here.
 * @param   {IProductsEntity} product - Product entity representing the special offer
 * @returns {OfferDetailView}         Parsed offer view-model
 */
export const parseOfferDetail = (product: IProductsEntity): OfferDetailView => {
  const name = product.localizeInfos?.title ?? '';

  /** `offer_description` is a plain `string` attribute; `plainValue` is a fallback */
  const attrDescription = product.attributeValues?.offer_description?.value;
  const description =
    typeof attrDescription === 'string' && attrDescription
      ? attrDescription
      : ((product.localizeInfos?.plainValue as string | undefined) ?? '');

  /** `offer_services` — entity list `[{ title, value: { id, parentId } }]` */
  const servicesArr = product.attributeValues?.offer_services?.value as
    | Array<{
        title?: string;
        value?: { id?: number | string; parentId?: number };
      }>
    | undefined;
  const services =
    servicesArr
      ?.map((service) => service.title)
      .filter((title): title is string => Boolean(title)) ?? [];

  /** `offer_sale` = current price, `offer_price` = crossed-out original (real → strings) */
  const price =
    Number(product.attributeValues?.offer_sale?.value) || product.price || 0;
  const original = Number(product.attributeValues?.offer_price?.value) || 0;
  const discount =
    original > price && price > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;

  /**
   * `offer_type` is a category entity (`Hair`/`Face`/`Body`/`Nails`) — use a
   * hex if one is ever stored, otherwise the per-category accent, else pink.
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
      ? CATEGORY_ACCENT[offerType.title]
      : '') ||
    '#ed21f1';
  const accentGrad =
    ACCENT_GRADIENTS[accentColor.toLowerCase()] ??
    `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`;

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

  return {
    name,
    description,
    services,
    price,
    original,
    discount,
    accentColor,
    accentGrad,
    image,
    duration,
    firstServiceParentId: servicesArr?.[0]?.value?.parentId ?? 0,
  };
};
