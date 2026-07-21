import type { OneEntryImageFile } from './OneEntryImageFile';

/**
 * Normalize a OneEntry image file into plain string URLs.
 *
 * `thumb` intentionally uses the full-resolution `downloadLink`: the only
 * `previewLink` variant is a tiny LQIP blur, unusable as a visible thumbnail.
 * `blur` returns the ready-made base64 data-URI when present, so callers can
 * skip generating their own LQIP.
 * @param   {OneEntryImageFile}                                    photo - Image file from an `attributeValues` group
 * @returns {{ full: string; thumb: string; blur: string | null }}       Rendering URLs
 */
export const getGalleryImageUrls = (
  photo: OneEntryImageFile,
): { full: string; thumb: string; blur: string | null } => {
  const preview = photo.previewLink;
  const previewPair =
    typeof preview === 'object' && preview
      ? preview[photo.defaultPreview ?? 'default']
      : undefined;
  const blur = previewPair?.[0] ?? null;
  const full = photo.downloadLink;
  return { full, thumb: full, blur };
};
