/**
 * formatOrderTotal — the order's `totalSum` as it should read in a card.
 *
 * The orders API returns the amount as a STRING (`"370"`), so it is parsed
 * rather than printed as-is: a round sum stays round (`370`, matching the
 * catalog's integer prices) and anything with fractions is pinned to two
 * decimals. A sum that does not parse returns `null` so the caller can drop the
 * line instead of rendering a lone currency glyph.
 * @param   {string | undefined} totalSum - `totalSum` of the order entity
 * @returns {string | null}               Amount to display, or `null` when there is none
 */
export const formatOrderTotal = (totalSum?: string): string | null => {
  if (!totalSum) {
    return null;
  }

  const amount = Number(totalSum);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
};
