/**
 * Offer accent color → light→dark gradient pairs from the static-html mock
 * (`data/offers.ts`). Keys are lowercase hex values of the `offer_type`
 * extended value.
 */
export const offerAccentGradientsData: Record<string, string> = {
  '#109aa9': 'linear-gradient(135deg,#26d2e6,#109aa9)',
  '#ed21f1': 'linear-gradient(135deg,#f60efb,#ed21f1)',
  '#9b4fb2': 'linear-gradient(135deg,#7e63ae,#9b4fb2)',
};
