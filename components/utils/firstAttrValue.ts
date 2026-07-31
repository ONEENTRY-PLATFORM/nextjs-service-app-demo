/**
 * firstAttrValue — read the single meaningful entry of an `attributeValues`
 * value that OneEntry may deliver either as a one-element array or as a bare
 * object.
 *
 * The SDK unwraps a single-file `image` attribute into a plain object
 * (`_clearArray`: `[img]` → `img`), and it does so unevenly — measured on this
 * project (`.claude/temp/inspect-attr-shapes.mjs`), a product hands back
 * `offer_image` as an **object**, while the same attribute type on pages,
 * blocks and admins (`page_hero_bg`, `bg_image`, `master_image`) arrives as a
 * one-element **array**. So the shape follows whether unwrapping happened, not
 * the entity kind: an array-only reader silently renders nothing the day its
 * value comes unwrapped. `text` blocks are not unwrapped today, but the SDK
 * contract documents both shapes for them as well.
 * @param   {unknown}       value - Raw `attributeValues.<marker>.value`
 * @returns {T | undefined}       First entry of an array, the object itself, or `undefined` for anything else (empty array, empty string of an unset attribute, `null`)
 */
export const firstAttrValue = <T>(value: unknown): T | undefined => {
  if (Array.isArray(value)) {
    return value[0] as T | undefined;
  }
  if (value && typeof value === 'object') {
    return value as T;
  }
  return undefined;
};
