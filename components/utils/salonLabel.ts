/**
 * salonLabel — short salon name for the specialist role line.
 *
 * The role line reads `<grade> · <salon>`, and the design spells the salon part
 * without the brand prefix. In the CMS the same salon
 * is titled `Thalia Downtown`, so the prefix has to come off here.
 *
 * This existed only inside the home strip's mapper, while `/masters` rendered
 * `salonNameById.get(id)` raw — the two surfaces disagreed on the same master
 * ("Top Stylist · Thalia Downtown" vs "Top Stylist · Downtown"), and `/masters`
 * was the one that contradicted the reference it was ported from.
 * @param   {string | undefined} title - Salon title as the CMS stores it
 * @returns {string}                   Salon name without the brand prefix
 */
export const salonLabel = (title: string | undefined): string =>
  (title ?? '').replace(/^Thalia\s+/i, '').trim();
