'use client';

import { Check, ChevronRight } from 'lucide-react';
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
import Dirham from '@/components/shared/Dirham';

/** Brand text colors from the static-html mock */
const DARK = '#4c4d56';
const MUTED = '#a8a9b5';

/**
 * OfferCard component — a special-offer card as in the static-html mock:
 * discount ribbon, name and tagline, the bundled services with check marks,
 * price with the dirham symbol, crossed-out old price and a "Book Offer"
 * button. A featured offer (`offer_type` = `party_star`) gets the full
 * accent-gradient background with white text.
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
  /** Get router instance for navigation */
  const router = useTransitionRouter();
  /** Get dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /** Offer data from CMS attributes */
  const name = product.localizeInfos?.title ?? '';
  const tagline =
    (product.localizeInfos?.plainValue as string | undefined) ?? '';
  const servicesArr = product.attributeValues?.services?.value as
    Array<{ title?: string; parentId?: number }> | undefined;
  const services =
    servicesArr?.map((service) => service.title).filter(Boolean) ?? [];
  const price = product.price ?? 0;
  const original =
    (product.attributeValues?.sale?.value as number | undefined) || 0;
  const discount =
    original > price && price > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;
  const offerTypeArr = product.attributeValues?.offer_type?.value as
    Array<{ value?: string; extended?: { value?: string } }> | undefined;
  const accentColor = offerTypeArr?.[0]?.extended?.value || '#ed21f1';
  const featured = offerTypeArr?.[0]?.value === 'party_star';
  const accentGrad = `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`;

  /** Category page of the first bundled service — needed for the booking cart */
  const { data: service } = useGetPageByIdQuery({
    id: servicesArr?.[0]?.parentId ?? 0,
  });

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

  /**
   * Render offer card following the static-html mock
   * @param e
   */
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
        <div
          className="px-6 pt-4 pb-7"
          style={{
            borderTop: `1px solid ${featured ? 'rgba(255,255,255,0.18)' : '#e8e8f0'}`,
          }}
        >
          <div className="mb-4 flex flex-wrap items-end gap-x-3 gap-y-1">
            {/* Price */}
            <span
              className="flex items-baseline text-[1.85rem] leading-none font-black whitespace-nowrap"
              style={{ color: featured ? '#fff' : DARK }}
            >
              <Dirham big /> {price}
            </span>
            {/* Old price */}
            {original > 0 && (
              <span
                className="mb-1 text-sm whitespace-nowrap line-through"
                style={{
                  color: featured ? 'rgba(255,255,255,0.55)' : MUTED,
                }}
              >
                <Dirham />
                {original}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBook();
            }}
            className="flex w-full items-center justify-center gap-1 rounded-xl py-3.5 text-base font-bold tracking-wider text-white uppercase transition-all hover:opacity-90 focus:outline-none"
            style={
              featured
                ? {
                    background: 'rgba(255,255,255,0.22)',
                    border: '1.5px solid rgba(255,255,255,0.4)',
                  }
                : {
                    background: accentGrad,
                    boxShadow: `0 8px 20px ${accentColor}44`,
                  }
            }
          >
            Book Offer <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </CardAnimations>
  );
};

export default OfferCard;
