'use client';

import { useTransitionRouter } from 'next-transition-router';
import { useState } from 'react';

import type { BookingData } from '@/components/layout/booking-page/types';
import { offerBookingHref } from '@/components/utils/offerBookingHref';

import type { OfferBookingInfo } from '../types';
import { offerBundledServices } from '../utils/offerBundledServices';

/**
 * The launch plumbing an offer card wires its "Book Offer" button to.
 * @property {boolean}    bookingOpen  - Whether the booking modal is open
 * @property {() => void} openBooking  - The "Book Offer" action: open the modal, or degrade to the wizard deep link
 * @property {() => void} closeBooking - Unmount the modal
 */
export interface OfferBookingLauncher {
  bookingOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
}

/**
 * useOfferBookingLauncher — the shared launch logic of both "Book Offer"
 * call sites (the offers page detail card and the home feed card), so the
 * degradation rule cannot drift between them.
 *
 * The modal opens only when the CMS actually gives it something to work
 * with: at least one salon, at least one specialist and at least one bundled
 * service RESOLVED against the catalog (an id-only check would open the
 * modal on a degraded catalog and let `useBookingSubmit`'s empty-products
 * branch fake a "Booking confirmed!" without creating anything). Otherwise
 * the button degrades to the booking wizard deep link, whose flexible flows
 * still book.
 * @param   {object}               props       - Hook parameters
 * @param   {OfferBookingInfo}     props.offer - The offer being booked
 * @param   {BookingData}          props.data  - Salons / services / specialists from the CMS
 * @returns {OfferBookingLauncher}             Modal open state and the gated open action
 */
export const useOfferBookingLauncher = ({
  offer,
  data,
}: {
  offer: OfferBookingInfo;
  data: BookingData;
}): OfferBookingLauncher => {
  const router = useTransitionRouter();
  const [bookingOpen, setBookingOpen] = useState(false);

  /**
   * Open the modal when the CMS data suffices, else deep-link the wizard.
   * @returns {void}
   */
  const openBooking = (): void => {
    const bundleResolved =
      offerBundledServices(data.services, offer.serviceProductIds).length > 0;
    if (data.salons.length > 0 && data.masters.length > 0 && bundleResolved) {
      setBookingOpen(true);
      return;
    }
    router.push(offerBookingHref(offer.serviceProductIds));
  };

  return {
    bookingOpen,
    openBooking,
    closeBooking: () => setBookingOpen(false),
  };
};
