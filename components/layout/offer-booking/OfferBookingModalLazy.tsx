'use client';

import dynamic from 'next/dynamic';

/**
 * OfferBookingModalLazy — the offer booking wizard as a lazily-loaded chunk.
 *
 * Both "Book Offer" call sites mount the modal conditionally, but a static
 * import would still bundle the whole wizard (salon → specialist → date & time
 * → summary, ~17 components with hooks and animations) into the initial JS of
 * `/` and `/offers` for every visitor. `dynamic()` with `ssr: false` splits it
 * into its own chunk that loads on demand; `prefetchOfferBooking` warms it
 * during hover/focus of the "Book Offer" button so the modal still appears
 * instantly on click.
 */
const OfferBookingModalLazy = dynamic(
  () => import('@/components/layout/offer-booking'),
  { ssr: false },
);

export default OfferBookingModalLazy;
