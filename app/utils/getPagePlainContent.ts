import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

/**
 * Plain-text body of a CMS page, for `description` in metadata and JSON-LD.
 *
 * A page carries its plain text in `plainContent`, never in the `plainValue`
 * the SDK also declares (live keys: `title`, `htmlContent`, `plainContent`,
 * `menuTitle`, `mdContent`) — reading `plainValue` always yields `undefined`
 * and silently falls through to the title. `ILocalizeInfo` declares
 * `plainContent` since SDK 1.0.158, so the field is read straight off the
 * entity; the cast this helper used to need is gone.
 *
 * Returns `undefined` rather than `''` so callers can chain `?? page.title`
 * without an empty string winning over the fallback.
 * @param   {IPagesEntity | undefined} page - CMS page entity, or nothing when unresolved
 * @returns {string | undefined}            Trimmed plain text, or `undefined` when the page has none
 */
export const getPagePlainContent = (
  page: IPagesEntity | undefined,
): string | undefined => {
  const plain = page?.localizeInfos?.plainContent?.trim();
  return plain ? plain : undefined;
};
