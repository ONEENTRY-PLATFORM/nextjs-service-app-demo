/**
 * serializeJsonLd — safely serialize a structured-data object for inlining in a
 * `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` alone is unsafe inside an inline `<script>`: any `<` in a
 * string value — most dangerously the literal `</script>` — closes the tag
 * early and lets the remainder of the (CMS-authored) value be parsed as HTML, a
 * stored-XSS vector even though the content is admin-entered. Escaping `<`, `>`
 * and `&` to their unicode escapes keeps the JSON semantically identical (the
 * `application/ld+json` parser decodes them back) while making a tag break-out
 * impossible.
 * @param   {object} data - JSON-LD structured-data object.
 * @returns {string}      Escaped JSON string, safe to inline as script content.
 */
export const serializeJsonLd = (data: object): string =>
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
