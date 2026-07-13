import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

/** Per-category accent fallback while `offer_type` is still a category entity */
const CATEGORY_ACCENT: Record<string, string> = {
  Hair: '#ed21f1',
  Face: '#9b4fb2',
  Body: '#109aa9',
  Nails: '#109aa9',
};

/** The view-model of a special-offer card, parsed from a CMS product. */
export interface OfferView {
  /** Offer name without the "(featured)" flag */
  name: string;
  /** Tagline under the name (`plainValue`) */
  tagline: string;
  /** Featured card (full accent-gradient background) */
  featured: boolean;
  /** Bundled service titles with check marks */
  services: string[];
  /** Current price (`offer_sale`, falls back to `product.price`) */
  price: number;
  /** Crossed-out original price (`offer_price`, `0` hides it) */
  original: number;
  /** Discount percent (`0` hides the ribbon) */
  discount: number;
  /** Accent colour hex from `offer_type` (per-category fallback) */
  accentColor: string;
  /** `linear-gradient` built from the accent colour */
  accentGrad: string;
  /** Category page id of the first bundled service (for the booking cart) */
  firstServiceParentId: number;
}

/**
 * parseOffer — build the {@link OfferView} of a special-offer card from a CMS
 * `offer` product (prefixed markers). Pure: all UI-shaping of the offer data
 * lives here so the card stays a render.
 * @param   {IProductsEntity} product - Product entity representing the special offer
 * @returns {OfferView}               Parsed offer view-model
 */
export const parseOffer = (product: IProductsEntity): OfferView => {
  const rawTitle = product.localizeInfos?.title ?? '';
  /** Featured card is flagged by "(featured)" in the title (no `party_star` value) */
  const featured = /\(featured\)/i.test(rawTitle);
  const name = rawTitle.replace(/\s*\(featured\)\s*/i, ' ').trim();
  const tagline =
    (product.localizeInfos?.plainValue as string | undefined) ?? '';

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
   * `offer_type` list value is the accent-colour hex (`#109AA9`). Falls back to
   * a per-category colour while it is still a category entity.
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
  const accentGrad = `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`;

  return {
    name,
    tagline,
    featured,
    services,
    price,
    original,
    discount,
    accentColor,
    accentGrad,
    firstServiceParentId: servicesArr?.[0]?.value?.parentId ?? 0,
  };
};
