'use client';

import { Check } from 'lucide-react';
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
import { productCurrency } from '@/components/shared/productCurrency';

import OfferCardFooter from './OfferCardFooter';
import { parseOffer } from './parseOffer';

/** Brand text colors from the static-html mock */
const DARK = '#4c4d56';
const MUTED = '#a8a9b5';

/**
 * OfferCard component — a special-offer card as in the static-html mock:
 * discount ribbon, name and tagline, the bundled services with check marks,
 * price with the dirham symbol, crossed-out old price and a "Book Offer"
 * button ({@link OfferCardFooter}). A featured offer gets the full
 * accent-gradient background with white text. Offer data is parsed by
 * {@link parseOffer}.
 *
 * Clicking the card opens the offers page; the button adds the offer to the
 * booking cart and navigates to booking.
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity representing the special offer
 * @param   {number}          props.index   - Index of the card for animation purposes
 * @returns {JSX.Element}                   React component representing an offer card with animation
 */
const OfferCard = ({
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
    tagline,
    featured,
    services,
    price,
    original,
    discount,
    accentColor,
    accentGrad,
    firstServiceParentId,
  } = parseOffer(product);

  /**
   * Category page of the first bundled service — needed for the booking cart.
   * Skip the request when there is no parent id (0 is not a valid page).
   */
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
      className="relative flex h-full min-h-100 cursor-pointer flex-col overflow-hidden rounded-3xl transition-transform duration-300 hover:-translate-y-1"
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
      <div
        data-testid="offer-card"
        data-product-id={product.id}
        onClick={() => router.push('/offers')}
        className="flex h-full flex-col"
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
          currency={productCurrency(product)}
          original={original}
          onBook={handleBook}
        />
      </div>
    </CardAnimations>
  );
};

export default OfferCard;
