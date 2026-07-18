'use client';

import { Clock } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import type { JSX } from 'react';
import { useState } from 'react';

import { PRODUCT_STATUS_IN_STOCK } from '@/app/api/utils/productStatusMarkers';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';
import CurrencySymbol from '@/components/shared/CurrencySymbol';

import type { ServiceItem } from './types';

/** Brand colors from the static-html mock (`PricesPage.tsx`) */
const PINK = '#ed21f1';
const PINK2 = '#f60efb';
const DARK = '#4c4d56';
const MUTED = '#a8a9b5';

/**
 * ServiceCard component — a single service card as in the static-html mock
 * (`PricesPage.tsx` → `ServiceCard`): name with description, price with the
 * dirham symbol (or a "Not available" badge), and a footer row with the
 * duration and a "Book" button. Hover lifts the shadow and fills the button
 * with the brand gradient.
 *
 * The button puts the service into the booking cart and navigates to the
 * booking page — same flow as `OfferCard`.
 * @param   {object}      props         - Component properties
 * @param   {ServiceItem} props.service - Plain service data mapped from the CMS product
 * @returns {JSX.Element}               Service card
 */
const ServiceCard = ({ service }: { service: ServiceItem }): JSX.Element => {
  const [hovered, setHovered] = useState(false);
  /** Get router instance for navigation */
  const router = useTransitionRouter();
  /** Get dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /**
   * A service is unavailable when it has no price OR the CMS flags it as not
   * in stock. Status matters independently of price: a priced service marked
   * out of stock must still show as unavailable. Every catalog product is
   * `in_stock` today, so this changes nothing now — it just stops the card from
   * lying once a service is ever taken out of stock in the admin panel.
   */
  const unavailable =
    service.price === null ||
    service.statusIdentifier !== PRODUCT_STATUS_IN_STOCK;

  /**
   * Add the service to the booking cart and navigate to the booking page
   * @returns {void}
   */
  const handleBook = () => {
    dispatch(
      addServiceToCart({
        id: activeId,
        serviceId: service.categoryId,
        productId: service.id,
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
    <div
      data-testid="service-card"
      data-service-id={service.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex h-full flex-col gap-3 rounded-2xl bg-white p-5"
      style={{
        boxShadow: hovered
          ? `0 8px 32px ${PINK}22, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 2px 12px rgba(0,0,0,0.05)',
        border: `1.5px solid ${hovered ? PINK + '44' : '#e8e8f0'}`,
        transition: 'box-shadow 0.25s, border-color 0.25s',
        opacity: unavailable ? 0.65 : 1,
      }}
    >
      {/* Top section: title + price */}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="text-base leading-snug font-semibold"
            style={{ color: DARK }}
          >
            {service.title}
          </p>
          {service.description && (
            <p className="mt-1 text-base" style={{ color: MUTED }}>
              {service.description}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {unavailable ? (
            <span
              className="rounded-md px-2 py-1 text-[10px] font-bold tracking-wide uppercase"
              style={{ background: `${MUTED}22`, color: MUTED }}
            >
              Not available
            </span>
          ) : (
            <div className="flex items-end leading-none">
              <span
                className="flex items-baseline font-medium whitespace-nowrap"
                style={{ fontSize: '1.5rem', lineHeight: 1, color: DARK }}
              >
                <CurrencySymbol currency={service.currency} big />{' '}
                {service.price}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer row: duration + Book — pinned to bottom of card */}
      <div
        className="mt-auto flex items-center justify-between gap-3 pt-3"
        style={{ borderTop: '1px solid #e8e8f0' }}
      >
        {service.duration !== null ? (
          <span
            className="inline-flex items-center gap-1 text-sm whitespace-nowrap"
            style={{ color: MUTED }}
          >
            <Clock size={17} /> {service.duration} min
          </span>
        ) : (
          <span />
        )}
        <button
          data-testid="service-book"
          onClick={handleBook}
          disabled={unavailable}
          className="rounded-xl px-12 py-3 text-base font-bold tracking-wide uppercase transition-all duration-200 active:scale-95"
          style={{
            background: unavailable
              ? `${MUTED}22`
              : hovered
                ? `linear-gradient(135deg,${PINK2},${PINK})`
                : `${PINK}12`,
            color: unavailable ? MUTED : hovered ? '#fff' : PINK,
            border: unavailable
              ? '1.5px solid transparent'
              : `1.5px solid ${PINK}`,
            boxShadow:
              unavailable || !hovered ? 'none' : `0 4px 12px ${PINK}44`,
            cursor: unavailable ? 'not-allowed' : 'pointer',
          }}
        >
          Book
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
