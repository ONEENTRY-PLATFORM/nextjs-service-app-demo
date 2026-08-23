'use client';

import { Clock } from 'lucide-react';
import type { IProductsEntity } from 'oneentry/types';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import type { BookingData } from '@/components/layout/booking-page/types';
import { useOfferBookingLauncher } from '@/components/layout/offer-booking/hooks/useOfferBookingLauncher';
import OfferBookingModalLazy from '@/components/layout/offer-booking/OfferBookingModalLazy';
import type { OfferBookingInfo } from '@/components/layout/offer-booking/types';
import DialogPortal from '@/components/shared/DialogPortal';
import { productCurrency } from '@/components/shared/productCurrency';

import OfferDetailMedia from './OfferDetailMedia';
import OfferDetailPanel from './OfferDetailPanel';
import { parseOfferDetail } from './parseOfferDetail';

/**
 * OfferDetailCard component — a full-width special-offer card: photo with a discount
 * badge and price overlay on the left ({@link OfferDetailMedia}), an
 * accent-gradient panel with the name, description, bundled services and a
 * "Book Offer" button on the right ({@link OfferDetailPanel}), and a duration
 * pill in the top-right corner. Offer data is parsed by {@link parseOfferDetail}.
 *
 * The button opens the offer booking modal (salon → specialist → date & time →
 * summary) over the page; while the CMS gives it nothing to work with, the
 * shared launcher ({@link useOfferBookingLauncher}) degrades to the booking
 * wizard deep link instead — same flow as the home page `OfferCard`.
 * @param   {object}          props             - Component properties
 * @param   {IProductsEntity} props.product     - Product entity representing the special offer (`offer`)
 * @param   {number}          props.index       - Card index — used for the animation stagger
 * @param   {BookingData}     props.bookingData - Salons / services / specialists the booking modal runs on
 * @returns {JSX.Element}                       Special-offer detail card
 */
const OfferDetailCard = ({
  product,
  index,
  bookingData,
}: {
  product: IProductsEntity;
  index: number;
  bookingData: BookingData;
}): JSX.Element => {
  const {
    name,
    description,
    services,
    price,
    original,
    discount,
    accentColor,
    accentGrad,
    image,
    imageBlur,
    duration,
    serviceProductIds,
  } = parseOfferDetail(product);

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
      className="relative grid grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-[320px_1fr]"
      style={{ boxShadow: `0 18px 50px ${accentColor}40` }}
    >
      {/* Duration — top-right corner */}
      {duration && (
        <span
          className="absolute top-5 right-5 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Clock size={16} /> {duration}
        </span>
      )}

      {/* Left — full-bleed photo with price overlay */}
      <OfferDetailMedia
        image={image}
        imageBlur={imageBlur}
        name={name}
        discount={discount}
        accentColor={accentColor}
        price={price}
        currency={offerInfo.currency}
        original={original}
      />

      {/* Right — accent gradient content panel */}
      <OfferDetailPanel
        name={name}
        description={description}
        services={services}
        accentGrad={accentGrad}
        onBook={openBooking}
      />

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

export default OfferDetailCard;
