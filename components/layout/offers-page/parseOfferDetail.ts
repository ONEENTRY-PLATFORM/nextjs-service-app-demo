import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { getGalleryImageUrls } from '@/components/utils/getGalleryImageUrls';
import type { OneEntryImageFile } from '@/components/utils/OneEntryImageFile';
import { parseOfferBase } from '@/components/utils/parseOfferBase';

/**
 * The view-model of a full-width offer detail card, parsed from a product.
 * @property {string}   name              - Offer name (`title`)
 * @property {string}   description       - Description (`offer_description` attribute, falls back to `plainValue`)
 * @property {string[]} services          - Bundled service titles (`offer_services`)
 * @property {number}   price             - Current price (`offer_sale`, falls back to `product.price`)
 * @property {number}   original          - Crossed-out original price (`offer_price`, `0` hides it)
 * @property {number}   discount          - Discount percent (`0` hides the badge)
 * @property {string}   accentColor       - Accent colour hex from `offer_type` (per-category fallback)
 * @property {string}   accentGrad        - Accent gradient (known pair or same-colour fallback)
 * @property {string}   image             - Offer photo (`offer_image` attribute, `''` when the CMS has none)
 * @property {string}   [imageBlur]       - Ready-made CMS LQIP of the photo (`previewLink`); `undefined` for files uploaded without previews, which turns the card's placeholder off.
 * @property {string}   duration          - Appointment duration line (`offer_time`, `''` hides the pill)
 * @property {number[]} serviceProductIds - Product ids of the bundled services — what "Book Offer" preselects
 */
export interface OfferDetailView {
  name: string;
  description: string;
  services: string[];
  price: number;
  original: number;
  discount: number;
  accentColor: string;
  accentGrad: string;
  image: string;
  imageBlur?: string | undefined;
  duration: string;
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
   *
   * `getGalleryImageUrls` also hands back the ready-made `previewLink` LQIP
   * when the file carries one, so the photo fades in from a blur.
   */
  const imageVal = product.attributeValues?.offer_image?.value as
    OneEntryImageFile | OneEntryImageFile[] | undefined;
  const imageFile = Array.isArray(imageVal) ? imageVal[0] : imageVal;
  const { full, blur } = imageFile?.downloadLink
    ? getGalleryImageUrls(imageFile)
    : { full: '', blur: null };
  const image = full;

  /** Appointment time line: `offer_time` string (e.g. "2 hours") */
  const rawDuration = product.attributeValues?.offer_time?.value;
  const duration =
    typeof rawDuration === 'string' && rawDuration
      ? rawDuration
      : typeof rawDuration === 'number'
        ? `${rawDuration} min`
        : '';

  return { ...base, name, image, imageBlur: blur ?? undefined, duration };
};
