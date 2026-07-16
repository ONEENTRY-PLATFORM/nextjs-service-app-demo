import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

/**
 * Plain-text body of a CMS page, for `description` in metadata and JSON-LD.
 *
 * The SDK's `ILocalizeInfo` type declares `plainValue`, but a page never carries
 * that field at runtime — its plain text arrives in `plainContent` (live keys:
 * `title`, `htmlContent`, `plainContent`, `menuTitle`, `mdContent`). Reading
 * `plainValue` therefore always yields `undefined` and silently falls through to
 * the title, which `tsc` cannot catch because the property exists in the type.
 * Hence the cast — it is the runtime shape, not the declared one.
 *
 * Returns `undefined` rather than `''` so callers can chain `?? page.title`
 * without an empty string winning over the fallback.
 * @param   {IPagesEntity | undefined} page - CMS page entity, or nothing when unresolved
 * @returns {string | undefined}            Trimmed plain text, or `undefined` when the page has none
 */
export const getPagePlainContent = (
  page: IPagesEntity | undefined,
): string | undefined => {
  const localizeInfos = page?.localizeInfos as
    { plainContent?: string | null } | undefined;
  const plain = localizeInfos?.plainContent?.trim();
  return plain ? plain : undefined;
};
