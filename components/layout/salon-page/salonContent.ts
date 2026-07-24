/**
 * Local accent color for the salon detail page.
 *
 * The salon's About copy, highlight bullets and photos now come from the CMS
 * page (rich-text body + `salon_images`); only the accent color stays in code.
 * Keyed by the salon `pageUrl` (`downtown` / `marina` / `jbr`).
 */

/** Accent color per salon `pageUrl` — matches the Contacts card cycling. */
export const SALON_COLOR: Record<string, string> = {
  downtown: '#ed21f1',
  marina: '#109aa9',
  jbr: '#9b4fb2',
};
