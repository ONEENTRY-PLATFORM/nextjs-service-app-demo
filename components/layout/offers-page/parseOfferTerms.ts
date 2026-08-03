import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

/**
 * The handful of named entities the admin's HTML editor (Jodit) actually emits
 * into `htmlContent`; rarer characters (the em-dash, for one) arrive literal.
 */
const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/**
 * toPlainLine — collapse one HTML fragment to its plain text: strip tags,
 * decode the known entities and squash whitespace.
 * @param   {string} html - Raw inner HTML of a list item or paragraph
 * @returns {string}      Trimmed plain text of the fragment
 */
const toPlainLine = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();

/**
 * parseOfferTerms — the "Good to know" bullet lines of `/offers`, read from the
 * built-in content field of the CMS `offers` page (not an attribute — the text
 * is authored in the page's HTML editor, so it lands in
 * `localizeInfos.htmlContent` while `plainContent` stays empty).
 *
 * The admin authors the terms as a `<ul>` — one `<li>` per term. When the
 * content is not a list (a re-edit could produce `<p>`-per-line just as well),
 * block-tag and `<br>` boundaries split it instead. Empty lines are dropped, so
 * a missing page or blank content yields `[]` and the "Good to know" block is
 * simply not rendered — a CMS flake never crashes this static route.
 *
 * `htmlContent` is declared on the SDK's `ILocalizeInfo`, so it is read straight
 * off the entity (same as `plainContent` in `getPagePlainContent`).
 * @param   {IPagesEntity | undefined} page - CMS `offers` page, or nothing when unresolved
 * @returns {string[]}                      Plain-text term lines, `[]` when the page has none
 */
export const parseOfferTerms = (page: IPagesEntity | undefined): string[] => {
  const html = page?.localizeInfos?.htmlContent ?? '';
  if (!html.trim()) return [];

  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) =>
    toPlainLine(m[1] ?? ''),
  );
  const lines =
    items.length > 0
      ? items
      : html.split(/<\/(?:p|div|h[1-6])>|<br\s*\/?>/gi).map(toPlainLine);
  return lines.filter(Boolean);
};
