'use client';

import { Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import Dirham from '@/components/shared/Dirham';

/** Brand text colors from the static-html mock */
const DARK = '#4c4d56';
const MUTED = '#a8a9b5';

/** Plain demo offer shape (subset of `homeOffersData`) */
export type DemoOffer = {
  id: string;
  name: string;
  tagline: string;
  services: string[];
  original: number;
  price: number;
  discount: string;
  featured?: boolean;
  accentColor: string;
  accentGrad: string;
};

/**
 * DemoOfferCard — the "BEST OFFERS" card rendered from plain demo data
 * (`homeOffersData`) while the CMS holds no `offer` products. Visually mirrors
 * the CMS-driven {@link OfferCard} and the static-html mock: discount ribbon,
 * name and tagline, bundled services with check marks, price with the dirham
 * symbol, crossed-out old price and a "Book Offer" button. A featured offer
 * gets the full accent-gradient background with white text.
 *
 * The card and the button both lead to the booking page — demo offers have no
 * CMS product to add to the cart.
 * @param   {object}      props        - Component properties
 * @param   {DemoOffer}   props.offer  - Plain demo offer
 * @param   {number}      props.index  - Index of the card for animation purposes
 * @returns {JSX.Element}              React component representing a demo offer card
 */
const DemoOfferCard = ({
  offer,
  index,
}: {
  offer: DemoOffer;
  index: number;
}): JSX.Element => {
  const { featured, accentColor, accentGrad } = offer;

  return (
    <CardAnimations
      index={index}
      className="relative flex h-full min-h-100 flex-col overflow-hidden rounded-3xl transition-transform duration-300 hover:-translate-y-1"
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
      <Link href="/offers" className="flex h-full flex-col">
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{
            borderBottom: `1px solid ${featured ? 'rgba(255,255,255,0.18)' : '#e8e8f0'}`,
          }}
        >
          {/* Discount ribbon */}
          <div className="mb-3 flex justify-end">
            <span
              className="rounded-full px-4 py-1.5 text-base font-black tracking-wide text-white"
              style={{
                background: featured ? 'rgba(255,255,255,0.22)' : accentColor,
                boxShadow: featured ? 'none' : `0 4px 12px ${accentColor}55`,
              }}
            >
              {offer.discount}
            </span>
          </div>
          <h3
            className="mb-1 text-[1.6rem] font-light whitespace-nowrap"
            style={{ color: featured ? '#fff' : DARK }}
          >
            {offer.name}
          </h3>
          <p
            className="text-base"
            style={{ color: featured ? 'rgba(255,255,255,0.75)' : MUTED }}
          >
            {offer.tagline}
          </p>
        </div>

        {/* Services */}
        <div className="flex-1 space-y-2.5 px-6 py-5">
          {offer.services.map((serviceTitle) => (
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
              <Dirham big /> {offer.price}
            </span>
            {/* Old price */}
            <span
              className="mb-1 text-sm whitespace-nowrap line-through"
              style={{ color: featured ? 'rgba(255,255,255,0.55)' : MUTED }}
            >
              <Dirham />
              {offer.original}
            </span>
          </div>
          <span
            className="flex w-full items-center justify-center gap-1 rounded-xl py-3.5 text-base font-bold tracking-wider text-white uppercase"
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
          </span>
        </div>
      </Link>
    </CardAnimations>
  );
};

export default DemoOfferCard;
