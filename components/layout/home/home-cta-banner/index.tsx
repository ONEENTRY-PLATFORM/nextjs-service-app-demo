import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { CSSProperties, JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import { firstAttrValue } from '@/components/utils/firstAttrValue';
import { getGalleryImageUrls } from '@/components/utils/getGalleryImageUrls';
import type { OneEntryImageFile } from '@/components/utils/OneEntryImageFile';
import { plainTextFromTextAttr } from '@/components/utils/plainTextFromTextAttr';

import CtaBannerOverlay from './components/CtaBannerOverlay';

/**
 * First image of an `image` block attribute: its URL plus the ready-made CMS
 * LQIP (`previewLink`), which the banner paints as the `<img>` background until
 * the artwork itself arrives.
 * @param   {unknown}                              value - Raw `attributeValues.<marker>.value`
 * @returns {{ url: string; blur: string | null }}       Image URL (`''` when empty) and its blur data URI
 */
const imageOf = (value: unknown): { url: string; blur: string | null } => {
  const file = firstAttrValue<OneEntryImageFile>(value);
  if (!file?.downloadLink) {
    return { url: '', blur: null };
  }
  const { full, blur } = getGalleryImageUrls(file);
  return { url: full, blur };
};

/**
 * Inline style painting the LQIP behind an `<img>` — visible only while the
 * full artwork is still downloading, then covered by the image itself.
 * @param   {string | null} blur - Base64 blur data URI, `null` when the CMS file has none
 * @returns {CSSProperties}      Background style, empty when there is no LQIP
 */
const blurStyle = (blur: string | null): CSSProperties =>
  blur
    ? {
        backgroundImage: `url("${blur}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

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
  const desktop = imageOf(attrs.bg_image?.value);
  const mobileOwn = imageOf(attrs.bg_image_mobile?.value);
  const mobile = mobileOwn.url ? mobileOwn : desktop;

  if (!desktop.url && !mobile.url) {
    return null;
  }

  const title = attrText(attrs.title?.value);
  /** The headline doubles as the alt text; an empty one leaves the art decorative. */
  const alt = title || block?.localizeInfos?.title || '';

  return (
    <section className="bg-white py-4 xl:py-10 md:py-6">
      <RevealAnimations className="page-shell w-full">
        <div className="relative w-full overflow-hidden rounded-3xl">
          {/* Mobile banner */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mobile.url}
            alt={alt}
            style={blurStyle(mobile.blur)}
            className="h-auto w-full object-cover md:hidden"
          />
          {/* Desktop banner */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktop.url || mobile.url}
            alt={alt}
            style={blurStyle(desktop.url ? desktop.blur : mobile.blur)}
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
