import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { offerAccentGradientsData, offerBannersData } from '@/components/data';

/**
 * Brand accent pairs from the static-html mock (`components/data.js`): each
 * known accent color maps to its light→dark gradient. Unknown accents fall
 * back to a same-color gradient like the home page `OfferCard`.
 */
const ACCENT_GRADIENTS: Record<string, string> = offerAccentGradientsData;

/**
 * Local offer banners (mock data from `components/data.js`) used while offer
 * products in the CMS have no photo attribute filled — cycled by card index
 * in the mock's order.
 */
const FALLBACK_IMAGES: string[] = offerBannersData;

/** The view-model of a full-width offer detail card, parsed from a product. */
export interface OfferDetailView {
  /** Offer name (`title`) */
  name: string;
  /** Description (`description` attribute, falls back to `plainValue`) */
  description: string;
  /** Bundled service titles */
  services: string[];
  /** Current price */
  price: number;
  /** Crossed-out original price (`sale`, `0` hides it) */
  original: number;
  /** Discount percent (`0` hides the badge) */
  discount: number;
  /** Accent colour hex (`offer_type` extended value) */
  accentColor: string;
  /** Accent gradient (known pair or same-colour fallback) */
  accentGrad: string;
  /** Offer photo (`image` attribute or a cycled mock banner) */
  image: string;
  /** Appointment duration line (`''` hides the pill) */
  duration: string;
  /** Category page id of the first bundled service (for the booking cart) */
  firstServiceParentId: number;
}

/**
 * parseOfferDetail — build the {@link OfferDetailView} of a full-width offer
 * card from a CMS `offer` product. Pure: all UI-shaping (accent gradient,
 * fallback banner by index, duration formatting) lives here.
 * @param   {IProductsEntity} product - Product entity representing the special offer
 * @param   {number}          index   - Card index (fallback photo + animation stagger)
 * @returns {OfferDetailView}         Parsed offer view-model
 */
export const parseOfferDetail = (
  product: IProductsEntity,
  index: number,
): OfferDetailView => {
  const name = product.localizeInfos?.title ?? '';
  const attrDescription = product.attributeValues?.description?.value;
  const description =
    typeof attrDescription === 'string' && attrDescription
      ? attrDescription
      : ((product.localizeInfos?.plainValue as string | undefined) ?? '');
  const servicesArr = product.attributeValues?.services?.value as
    Array<{ title?: string; parentId?: number }> | undefined;
  const services =
    servicesArr
      ?.map((service) => service.title)
      .filter((title): title is string => Boolean(title)) ?? [];
  const price = product.price ?? 0;
  const original =
    (product.attributeValues?.sale?.value as number | undefined) || 0;
  const discount =
    original > price && price > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;
  const offerTypeArr = product.attributeValues?.offer_type?.value as
    Array<{ value?: string; extended?: { value?: string } }> | undefined;
  const accentColor = offerTypeArr?.[0]?.extended?.value || '#ed21f1';
  const accentGrad =
    ACCENT_GRADIENTS[accentColor.toLowerCase()] ??
    `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`;

  /** Offer photo: `image` attribute or a local mock banner cycled by index */
  const imageArr = product.attributeValues?.image?.value as
    Array<{ downloadLink?: string }> | undefined;
  const image =
    imageArr?.[0]?.downloadLink ||
    (FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] as string);

  /** Approximate appointment time: `duration` attribute, number = minutes */
  const rawDuration = product.attributeValues?.duration?.value;
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
    firstServiceParentId: servicesArr?.[0]?.parentId ?? 0,
  };
};
