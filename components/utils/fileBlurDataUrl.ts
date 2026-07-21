import { getGalleryImageUrls } from './getGalleryImageUrls';
import type { OneEntryImageFile } from './OneEntryImageFile';

/**
 * Ready-made blur data URI of a CMS file attribute (`image` / `groupOfImages`),
 * for `next/image`'s `blurDataURL`.
 *
 * OneEntry ships the LQIP with the entity as `previewLink.default[0]`
 * (`data:image/webp;base64,…`), so nothing has to be fetched or generated. Files
 * uploaded without the `template=1` flag carry no `previewLink` at all — hence
 * the `undefined`, which callers turn into `placeholder="empty"`.
 * @param   {unknown}            value - Raw `attributeValues.<marker>.value`
 * @returns {string | undefined}       Base64 data URI, or `undefined` when absent
 */
export const fileBlurDataUrl = (value: unknown): string | undefined => {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }
  const first = value[0] as OneEntryImageFile | undefined;
  if (!first) {
    return undefined;
  }
  return getGalleryImageUrls(first).blur ?? undefined;
};
