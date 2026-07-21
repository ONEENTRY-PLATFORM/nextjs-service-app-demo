/**
 * The CMS attribute-set marker that turns a catalog product into a special
 * offer. Special offers carry the `offer` set; regular services carry `service`.
 * The marker lives in exactly one place in OneEntry, so it lives in exactly one
 * place here.
 */
const OFFER_ATTRIBUTE_SET = 'offer';

/** The minimal product shape the offer check reads. */
type OfferCandidate = { attributeSetIdentifier?: string | null };

/**
 * Whether a catalog product is a special offer (the `offer` attribute set)
 * rather than a regular service. Single source of truth for that split — the
 * offers page, the home offers feed, the services catalog and search all route
 * through this predicate, so renaming the CMS marker is a one-line change here
 * instead of a hunt across call sites.
 * @param   {OfferCandidate} product - Catalog product entity
 * @returns {boolean}                `true` when the product is an offer
 */
export const isOfferProduct = (product: OfferCandidate): boolean =>
  product.attributeSetIdentifier === OFFER_ATTRIBUTE_SET;
