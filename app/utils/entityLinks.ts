/** One link of an `entity` attribute, decoded into the parts callers use. */
export interface EntityLink {
  /** Title the CMS shows for the linked item (`''` when absent) */
  title: string;
  /**
   * Raw linked id. A PAGE link stores a number; a PRODUCT link stores the
   * composite string `p-{pageId}-{productId}`.
   */
  id: number | string | undefined;
  /** Id of the linked item's parent page, when the CMS provides one */
  parentId: number | undefined;
}

/**
 * entityLinks — read an `entity` attribute value into a usable array.
 *
 * An `entity` attribute arrives as `[{ title, value: { id, parentId, … } }]`,
 * but an attribute with nothing selected comes back as the empty STRING. Every
 * call site used to cast the value straight to an array and index or `.map` it;
 * two of those (`offer_services` in both offer parsers) threw outright on the
 * empty string, and the rest silently relied on optional chaining.
 *
 * Nothing is converted here — a product id stays the composite string the CMS
 * stores, because only the caller knows whether it wants the product or its
 * parent page.
 * @param   {unknown}      value - Raw `attributeValues.<marker>.value`
 * @returns {EntityLink[]}       Decoded links; empty for any non-array value
 */
export const entityLinks = (value: unknown): EntityLink[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return (
    value as Array<{
      title?: string;
      value?: { id?: number | string; parentId?: number };
    }>
  ).map((entry) => ({
    title: typeof entry?.title === 'string' ? entry.title : '',
    id: entry?.value?.id,
    parentId:
      typeof entry?.value?.parentId === 'number'
        ? entry.value.parentId
        : undefined,
  }));
};

/**
 * entityPageIds — the numeric PAGE ids of an `entity` attribute.
 *
 * Links to products are skipped: their id is the composite `p-…` string, not a
 * page id, so a caller after pages would otherwise get `NaN`.
 * @param   {unknown}  value - Raw `attributeValues.<marker>.value`
 * @returns {number[]}       Page ids of the links
 */
export const entityPageIds = (value: unknown): number[] =>
  entityLinks(value)
    .map((link) => link.id)
    .filter((id): id is number => typeof id === 'number');

/**
 * entityProductIds — the numeric PRODUCT ids of an `entity` attribute.
 *
 * A product link stores `p-{pageId}-{productId}`; a plain number there is a
 * page link (a category, not a bookable product) and is skipped.
 * @param   {unknown}  value - Raw `attributeValues.<marker>.value`
 * @returns {number[]}       Product ids of the links
 */
export const entityProductIds = (value: unknown): number[] => {
  const ids: number[] = [];
  for (const link of entityLinks(value)) {
    if (typeof link.id !== 'string' || !link.id.startsWith('p-')) {
      continue;
    }
    const productId = Number(link.id.split('-')[2]);
    if (productId) {
      ids.push(productId);
    }
  }
  return ids;
};
