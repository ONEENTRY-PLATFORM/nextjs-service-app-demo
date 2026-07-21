/**
 * Product ids of the services an offer bundles, read from its `offer_services`
 * entity attribute.
 *
 * A product link stores its id as the composite string `p-{pageId}-{productId}`
 * (a plain number there is a page link — a category, not a bookable service —
 * and is skipped). These ids are what the booking wizard selects with: an offer
 * is not itself a bookable product, so "Book Offer" carries its bundled
 * services rather than the offer product id.
 * @param   {unknown}  value - Raw `attributeValues.offer_services.value`
 * @returns {number[]}       Product ids of the bundled services (empty when unset)
 */
export const offerServiceProductIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids: number[] = [];
  for (const entry of value as Array<{ value?: { id?: number | string } }>) {
    const raw = entry?.value?.id;
    if (typeof raw !== 'string' || !raw.startsWith('p-')) {
      continue;
    }
    const productId = Number(raw.split('-')[2]);
    if (productId) {
      ids.push(productId);
    }
  }
  return ids;
};
