/**
 * Per-category accent fallback for special offers.
 *
 * `offer_type` is meant to carry the accent colour itself (a hex like `#109AA9`),
 * but while it is still filled with a category entity (`Hair` / `Face` / `Body` /
 * `Nails`) the colour is derived from the category title instead. Temporary,
 * like everything else in `components/data/` — drop it once every offer in the
 * CMS stores a hex.
 */
export const offerCategoryAccentsData: Record<string, string> = {
  Hair: '#ed21f1',
  Face: '#9b4fb2',
  Body: '#109aa9',
  Nails: '#109aa9',
};
