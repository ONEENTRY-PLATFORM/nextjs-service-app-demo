/**
 * Product status markers configured in the OneEntry admin panel.
 *
 * Markers are project-specific, so they are kept here rather than inlined at
 * call sites: a rename in the admin panel becomes a one-line change.
 *
 * Verified against the live project (`ProductStatuses.getProductStatuses`,
 * 2026-07-16): `in_stock` is the ONLY status defined, and all 77 catalog
 * services carry it.
 */

/** The only product status defined in this project ("In stock"). */
export const PRODUCT_STATUS_IN_STOCK = 'in_stock';
