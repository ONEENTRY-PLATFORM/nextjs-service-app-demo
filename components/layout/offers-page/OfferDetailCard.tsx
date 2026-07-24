'use client';

import { Clock } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import { offerBookingHref } from '@/components/utils/offerBookingHref';
import { productCurrency } from '@/components/shared/productCurrency';

import OfferDetailMedia from './OfferDetailMedia';
import OfferDetailPanel from './OfferDetailPanel';
import { parseOfferDetail } from './parseOfferDetail';

/**
 * OfferDetailCard component — a full-width special-offer card as in the
 * static-html mock (`OffersPage.tsx` → `OfferDetail`): photo with a discount
 * badge and price overlay on the left ({@link OfferDetailMedia}), an
 * accent-gradient panel with the name, description, bundled services and a
 * "Book Offer" button on the right ({@link OfferDetailPanel}), and a duration
 * pill in the top-right corner. Offer data is parsed by {@link parseOfferDetail}.
 *
 * The button opens the booking wizard with the offer's bundled services
 * preselected — same flow as the home page `OfferCard`.
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity representing the special offer (`offer`)
 * @param   {number}          props.index   - Card index — used for the animation stagger
 * @returns {JSX.Element}                   Special-offer detail card
 */
const OfferDetailCard = ({
  product,
  index,
}: {
  product: IProductsEntity;
  index: number;
}): JSX.Element => {
  const router = useTransitionRouter();

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
    duration,
    serviceProductIds,
  } = parseOfferDetail(product);

  /**
   * Open the booking wizard with the offer's bundled services preselected.
   *
   * The offer product itself is NOT bookable — it carries the `offer`
   * attribute set and is excluded from the booking catalog — so the link
   * names the services it bundles instead.
   * @returns {void}
   */
  const handleBook = () => {
    router.push(offerBookingHref(serviceProductIds));
  };

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
        name={name}
        discount={discount}
        accentColor={accentColor}
        price={price}
        currency={productCurrency(product)}
        original={original}
      />

      {/* Right — accent gradient content panel */}
      <OfferDetailPanel
        name={name}
        description={description}
        services={services}
        accentGrad={accentGrad}
        onBook={handleBook}
      />
    </CardAnimations>
  );
};

export default OfferDetailCard;
