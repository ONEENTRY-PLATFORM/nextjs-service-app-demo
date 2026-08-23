'use client';

import { Check } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import type { IProductsEntity } from 'oneentry/types';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import type { BookingData } from '@/components/layout/booking-page/types';
import { useOfferBookingLauncher } from '@/components/layout/offer-booking/hooks/useOfferBookingLauncher';
import OfferBookingModalLazy from '@/components/layout/offer-booking/OfferBookingModalLazy';
import type { OfferBookingInfo } from '@/components/layout/offer-booking/types';
import DialogPortal from '@/components/shared/DialogPortal';
import { productCurrency } from '@/components/shared/productCurrency';

import OfferCardFooter from './OfferCardFooter';
import { parseOffer } from './parseOffer';

/** Brand text colors */
const DARK = '#4c4d56';
const MUTED = '#a8a9b5';

/**
 * OfferCard component — a special-offer card:
 * discount ribbon, name and tagline, the bundled services with check marks,
 * price with the dirham symbol, crossed-out old price and a "Book Offer"
 * button ({@link OfferCardFooter}). A featured offer gets the full
 * accent-gradient background with white text. Offer data is parsed by
 * {@link parseOffer}.
 *
 * Clicking the card opens the offers page; the button opens the offer booking
 * modal (salon → specialist → date & time → summary) over the page, falling
 * back to the booking wizard deep link while the CMS gives the modal nothing
 * to work with.
 * @param   {object}          props             - Component properties
 * @param   {IProductsEntity} props.product     - Product entity representing the special offer
 * @param   {number}          props.index       - Index of the card for animation purposes
 * @param   {BookingData}     props.bookingData - Salons / services / specialists the booking modal runs on
 * @returns {JSX.Element}                       React component representing an offer card with animation
 */
const OfferCard = ({
  product,
  index,
  bookingData,
}: {
  product: IProductsEntity;
  index: number;
  bookingData: BookingData;
}): JSX.Element => {
  const router = useTransitionRouter();

  const {
    name,
    tagline,
    featured,
    services,
    price,
    original,
    discount,
    accentColor,
    accentGrad,
    serviceProductIds,
  } = parseOffer(product);

  /** The offer summary the booking modal renders and books from. */
  const offerInfo: OfferBookingInfo = {
    productId: product.id,
    name,
    services,
    price,
    original,
    currency: productCurrency(product),
    accentColor,
    accentGrad,
    serviceProductIds,
  };

  const { bookingOpen, openBooking, closeBooking } = useOfferBookingLauncher({
    offer: offerInfo,
    data: bookingData,
  });

  return (
    <CardAnimations
      index={index}
      className={`relative flex h-full min-h-100 cursor-pointer flex-col overflow-hidden rounded-3xl transition-transform duration-300 ${featured ? 'hover:-translate-y-1.5' : 'hover:-translate-y-1'}`}
      style={
        featured
          ? {
              background: accentGrad,
              boxShadow: `0 20px 60px ${accentColor}44`,
              zIndex: 2,
            }
          : {
              background: '#fff',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              border: '1.5px solid #e8e8f0',
              zIndex: 1,
            }
      }
    >
      {/* role="button" instead of <button>: the footer nests the Book button,
          and interactive content may not nest inside a real <button> */}
      <div
        data-testid="offer-card"
        data-product-id={product.id}
        role="button"
        tabIndex={0}
        aria-label={`View offer: ${name}`}
        onClick={() => router.push('/offers')}
        onKeyDown={(e) => {
          // Keydown from the nested Book button bubbles up here; without this
          // guard Enter/Space on it would be hijacked into card navigation
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push('/offers');
          }
        }}
        // Inward-drawn ring: the animation wrapper's overflow-hidden would
        // clip the global outward :focus-visible outline
        className={`flex h-full flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 ${featured ? 'focus-visible:outline-white' : 'focus-visible:outline-accent-pink'}`}
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{
            borderBottom: `1px solid ${featured ? 'rgba(255,255,255,0.18)' : '#e8e8f0'}`,
          }}
        >
          {/* Discount ribbon */}
          {discount > 0 && (
            <div className="mb-3 flex justify-end">
              <span
                className="rounded-full px-4 py-1.5 text-base font-black tracking-wide text-white"
                style={{
                  background: featured ? 'rgba(255,255,255,0.22)' : accentColor,
                  boxShadow: featured ? 'none' : `0 4px 12px ${accentColor}55`,
                }}
              >
                -{discount}%
              </span>
            </div>
          )}
          <h3
            className="mb-1 text-[1.6rem] font-light whitespace-nowrap"
            style={{ color: featured ? '#fff' : DARK }}
          >
            {name}
          </h3>
          {tagline && (
            <p
              className="text-base"
              style={{ color: featured ? 'rgba(255,255,255,0.75)' : MUTED }}
            >
              {tagline}
            </p>
          )}
        </div>

        {/* Services */}
        <div className="flex-1 space-y-2.5 px-6 py-5">
          {services.map((serviceTitle) => (
            <div key={serviceTitle} className="flex items-center gap-2.5">
              <div
                className="flex size-5 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: featured
                    ? 'rgba(255,255,255,0.25)'
                    : `${accentColor}18`,
                }}
              >
                <Check size={15} color={featured ? '#fff' : accentColor} />
              </div>
              <span
                className="text-base"
                style={{ color: featured ? 'rgba(255,255,255,0.92)' : DARK }}
              >
                {serviceTitle}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <OfferCardFooter
          featured={featured}
          accentColor={accentColor}
          accentGrad={accentGrad}
          price={price}
          currency={offerInfo.currency}
          original={original}
          onBook={openBooking}
        />
      </div>

      {/* Booking modal — portaled out of the animation wrapper's transform;
          the wizard chunk is lazy and warmed by the Book button's hover */}
      {bookingOpen && (
        <DialogPortal>
          <OfferBookingModalLazy
            offer={offerInfo}
            data={bookingData}
            onClose={closeBooking}
          />
        </DialogPortal>
      )}
    </CardAnimations>
  );
};

export default OfferCard;
