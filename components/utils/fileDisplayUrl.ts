import { firstAttrValue } from './firstAttrValue';

/**
 * Display URL of a CMS file attribute (`image` / `groupOfImages`), e.g. an
 * admin's `master_image`.
 *
 * `downloadLink` wins on purpose: `previewLink.default[1]` is a **20×20, ~1 KB**
 * LQIP placeholder (measured on the live CDN), not a thumbnail — rendering a
 * portrait from it would show a blurry square. The preview URLs are only a last
 * resort for legacy files that carry no `downloadLink` at all. For the blur data
 * URI use `fileBlurDataUrl` instead.
 *
 * Both value shapes are accepted — see {@link firstAttrValue} for why a single
 * `image` file can arrive unwrapped.
 * @param   {unknown} value - Raw `attributeValues.<marker>.value`
 * @returns {string}        File URL, or `''` when the attribute is empty
 */
export const fileDisplayUrl = (value: unknown): string => {
  const first = firstAttrValue<{
    previewLink?: string | { default?: string[] };
    downloadLink?: string | { default?: string[] };
  }>(value);
  const link = first?.downloadLink ?? first?.previewLink;
  if (!link) {
    return '';
  }
  if (typeof link === 'string') {
    return link;
  }
  return link.default?.[1] ?? link.default?.[0] ?? '';
};
