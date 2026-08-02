/**
 * prefetchOfferBooking — warm the offer booking wizard's chunk before the
 * visitor opens it.
 *
 * The wizard is split out of the initial bundle by `OfferBookingModalLazy`, so
 * the first click would otherwise pay for downloading the chunk. Calling this
 * on `onPointerEnter` / `onFocus` of a "Book Offer" button starts that
 * download during the hover, making the modal appear instantly on click. It is
 * safe to call repeatedly: the bundler resolves the chunk once and later calls
 * hit the module cache.
 */
export const prefetchOfferBooking = (): void => {
  void import('@/components/layout/offer-booking').catch(() => {});
};
