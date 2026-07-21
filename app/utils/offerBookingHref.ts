/**
 * Booking-wizard link of an offer's "Book Offer" button: `/booking` carrying
 * the ids of the services the offer bundles, so the wizard preselects them
 * (`useServicesPrefill` → `useBookingPreselect`).
 *
 * An offer with no linked services degrades to the plain wizard rather than an
 * empty query — the CMS may simply not have `offer_services` filled yet.
 * @param   {number[]} serviceProductIds - Product ids of the bundled services
 * @returns {string}                     `/booking` link, with `?services=` when there are ids
 */
export const offerBookingHref = (serviceProductIds: number[]): string =>
  serviceProductIds.length > 0
    ? `/booking?services=${serviceProductIds.join(',')}`
    : '/booking';
