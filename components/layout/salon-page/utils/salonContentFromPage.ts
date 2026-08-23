import type { IPagesEntity } from 'oneentry/types';

/**
 * About paragraphs and highlight bullets read from a salon page.
 * @property {string[]} about      - "About this studio" paragraphs (the page's `<p>` blocks)
 * @property {string[]} highlights - Highlight bullets (the page's `<li>` items)
 */
export interface SalonCopy {
  about: string[];
  highlights: string[];
}

/**
 * Decode the handful of HTML entities a OneEntry rich-text body can carry, so
 * the stripped text reads as plain prose (`&amp;` → `&`, `&#39;` → `'`).
 * `&amp;` is decoded last so an already-escaped `&amp;lt;` is not turned into a
 * live tag.
 * @param   {string} html - Raw text between tags
 * @returns {string}      Decoded text
 */
const decodeEntities = (html: string): string =>
  html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&amp;/g, '&');

/**
 * Text content of an HTML fragment: inner tags removed, entities decoded and
 * surrounding whitespace trimmed.
 * @param   {string} html - HTML fragment
 * @returns {string}      Plain text
 */
const textOf = (html: string): string =>
  decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Collect the text of every block matching `tag` in document order.
 * @param   {string}   html - HTML source
 * @param   {string}   tag  - Tag name to extract (`p`, `li`)
 * @returns {string[]}      Non-empty text of each block
 */
const blocks = (html: string, tag: string): string[] =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))]
    .map((match) => textOf(match[1] ?? ''))
    .filter(Boolean);

/**
 * salonContentFromPage — read the salon's descriptive copy from its CMS page.
 *
 * The About paragraphs and highlight bullets live in the page's built-in
 * rich-text body (`localizeInfos.htmlContent`), not in attributes: `<p>` blocks
 * become About paragraphs and `<li>` items become highlights. Returns empty
 * lists when the body is missing or has no such blocks, so the caller can fall
 * back to the local `salonContent.ts` copy.
 * @param   {IPagesEntity} page - Salon page from the CMS
 * @returns {SalonCopy}         About paragraphs and highlight bullets
 */
export const salonContentFromPage = (page: IPagesEntity): SalonCopy => {
  const html = page.localizeInfos?.htmlContent ?? '';
  return {
    about: blocks(html, 'p'),
    highlights: blocks(html, 'li'),
  };
};
