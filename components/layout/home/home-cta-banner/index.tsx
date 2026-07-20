import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import type { OneEntryImageFile } from '@/components/utils';
import { getGalleryImageUrls, plainTextFromTextAttr } from '@/components/utils';

import CtaBannerOverlay from './components/CtaBannerOverlay';

/**
 * First image URL of an `image` block attribute.
 * @param   {unknown} value - Raw `attributeValues.<marker>.value`
 * @returns {string}        Image URL, or `''` when the attribute is empty
 */
const imageUrl = (value: unknown): string => {
  if (!Array.isArray(value) || value.length === 0) {
    return '';
  }
  const file = value[0] as OneEntryImageFile | undefined;
  return file?.downloadLink ? getGalleryImageUrls(file).full : '';
};

/**
 * Plain text of a block attribute, tolerating both `string` and `text` markers.
 * @param   {unknown} value - Raw `attributeValues.<marker>.value`
 * @returns {string}        Trimmed text, or `''`
 */
const attrText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : plainTextFromTextAttr(value);

/**
 * HomeCtaBanner — the booking CTA banner between the BEST OFFERS and OUR
 * SPECIALISTS sections, driven entirely by the `home_discounts` block.
 *
 * Both the artwork and the copy come from the CMS: the banner images are clean
 * photos (`bg_image` wide, `bg_image_mobile` portrait) and the promo text is
 * overlaid from the block attributes, so nothing is baked into the artwork and
 * a banner swap needs no code change. Without a CMS image there is no banner —
 * the section is skipped rather than falling back to a bundled asset.
 *
 * Wrapped in {@link RevealAnimations} so the banner slides up and fades in as it
 * scrolls into view and fades away on page transitions, matching the other
 * home-page cards.
 * @param   {object}             props         - Component properties
 * @param   {IBlockEntity}       [props.block] - The `home_discounts` block
 * @returns {JSX.Element | null}               CTA banner section, or `null` while the CMS holds no artwork
 */
const HomeCtaBanner = ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): JSX.Element | null => {
  const attrs = (block?.attributeValues ?? {}) as Record<
    string,
    { value?: unknown } | undefined
  >;

  /** Mobile keeps its own portrait crop; the wide banner stands in when absent. */
  const desktop = imageUrl(attrs.bg_image?.value);
  const mobile = imageUrl(attrs.bg_image_mobile?.value) || desktop;

  if (!desktop && !mobile) {
    return null;
  }

  const title = attrText(attrs.title?.value);
  /** The headline doubles as the alt text; an empty one leaves the art decorative. */
  const alt = title || block?.localizeInfos?.title || '';

  return (
    <section className="bg-white py-4 xl:py-10 md:py-6">
      <RevealAnimations className="mx-auto w-full max-w-7xl px-3 md:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl">
          {/* Mobile banner */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mobile}
            alt={alt}
            className="h-auto w-full object-cover md:hidden"
          />
          {/* Desktop banner */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktop || mobile}
            alt={alt}
            className="hidden h-auto w-full object-cover md:block"
          />
          <CtaBannerOverlay
            title={title}
            buttonText={attrText(attrs.button_text?.value)}
          />
        </div>
      </RevealAnimations>
    </section>
  );
};

export default HomeCtaBanner;
