'use client';

import { Clock } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import { useGetPageByIdQuery } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';

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
 * The button adds the offer to the booking cart and navigates to the booking
 * page — same flow as the home page `OfferCard`.
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity representing the special offer (`offer`)
 * @param   {number}          props.index   - Card index — used for animation stagger and the fallback photo
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
  const dispatch = useAppDispatch();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

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
    firstServiceParentId,
  } = parseOfferDetail(product, index);

  /** Category page of the first bundled service — needed for the booking cart */
  const { data: service } = useGetPageByIdQuery(
    { id: firstServiceParentId },
    { skip: !firstServiceParentId },
  );

  /**
   * Add the offer to the booking cart and navigate to the booking page
   * @returns {void}
   */
  const handleBook = () => {
    /** Don't proceed if service data is not available */
    if (!service) {
      return;
    }
    dispatch(
      addServiceToCart({
        id: activeId,
        serviceId: service.id,
        productId: product.id,
        salonId: null,
        masterId: null,
        date: null,
      }),
    );
    dispatch(setTabsState({ key: 'services', value: true }));
    dispatch(setTabsState({ key: 'products', value: true }));
    router.push('/booking');
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
