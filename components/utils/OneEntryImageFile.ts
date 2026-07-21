/**
 * A single image inside a `groupOfImages` / `image` attribute value.
 *
 * `previewLink` shape is inconsistent across uploads: older files have no
 * `previewLink` at all, newer ones expose it as an object
 * `{ [defaultPreview]: [blurDataUri, lqipUrl] }` (NOT a string). Reading it
 * directly into an `<img src>` stringifies the object to `"[object Object]"`
 * and 404s, so always normalize through `getGalleryImageUrls`.
 *
 * Note: the second entry (`lqipUrl`) is a ~16px LQIP placeholder (~1 KB), not a
 * display-ready thumbnail — the full `downloadLink` is the only rendering URL.
 */
export type OneEntryImageFile = {
  downloadLink: string;
  previewLink?: string | Record<string, [string, string] | undefined>;
  defaultPreview?: string;
};
