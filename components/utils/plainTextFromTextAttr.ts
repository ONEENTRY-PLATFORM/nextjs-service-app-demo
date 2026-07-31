import { firstAttrValue } from './firstAttrValue';

/**
 * Extract plain text from a `text`-type attribute value.
 *
 * A `text` attribute's `value` is a block of `{ htmlValue, plainValue,
 * mdValue }` — an array of them in practice, though the SDK contract allows the
 * bare object too ({@link firstAttrValue}). This reads the first block, prefers
 * `plainValue`, and — since in this CMS `plainValue` is frequently empty —
 * falls back to stripping tags off `htmlValue` and decoding the common HTML
 * entities. Tolerates the legacy plain-string shape too. Returns plain text
 * suitable for a `line-clamp`ed `<p>` (not HTML — use `html-react-parser` when
 * rich markup is needed).
 * @param   {unknown} value - Raw `attributeValues.<marker>.value` of a text attribute
 * @returns {string}        Plain text, or `''`
 */
export const plainTextFromTextAttr = (value: unknown): string => {
  if (typeof value === 'string') return value;
  const first = firstAttrValue<{ plainValue?: string; htmlValue?: string }>(
    value,
  );
  const plain = first?.plainValue?.trim();
  if (plain) return plain;
  const html = first?.htmlValue;
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};
