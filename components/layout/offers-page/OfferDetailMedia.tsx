import Image from 'next/image';
import type { JSX } from 'react';

import CurrencySymbol from '@/components/shared/CurrencySymbol';

/**
 * OfferDetailMedia — the left photo pane of an offer detail card: a full-bleed
 * image with a discount badge and a price overlay (current price + crossed-out
 * original) at the bottom.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.image       - Photo URL
 * @param   {string}      props.name        - Offer name (alt text)
 * @param   {number}      props.discount    - Discount percent (`0` hides the badge)
 * @param   {string}      props.accentColor - Accent colour hex (badge)
 * @param   {number}      props.price       - Current price
 * @param   {number}      props.original    - Crossed-out original price (`0` hides it)
 * @param   {string}      [props.currency]  - Currency code from the CMS
 * @returns {JSX.Element}                   Photo pane
 */
const OfferDetailMedia = ({
  image,
  name,
  discount,
  accentColor,
  price,
  original,
  currency,
}: {
  image: string;
  name: string;
  discount: number;
  accentColor: string;
  price: number;
  original: number;
  currency?: string | undefined;
}): JSX.Element => (
  <div className="relative min-h-60">
    <Image
      src={image}
      alt={name}
      fill
      sizes="(max-width: 768px) 100vw, 320px"
      className="object-cover"
    />
    {discount > 0 && (
      <span
        className="absolute top-4 left-4 rounded-full px-4 py-1.5 text-base font-black text-white"
        style={{
          background: accentColor,
          boxShadow: `0 4px 12px ${accentColor}66`,
        }}
      >
        -{discount}%
      </span>
    )}
    <div
      className="absolute inset-x-0 bottom-0 flex items-end gap-2 p-4"
      style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}
    >
      <span
        className="flex items-baseline leading-none font-black text-white"
        style={{ fontSize: '1.9rem' }}
      >
        <CurrencySymbol currency={currency} big />
        {price}
      </span>
      {original > 0 && (
        <span
          className="mb-0.5 flex items-baseline text-sm line-through"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <CurrencySymbol currency={currency} />
          {original}
        </span>
      )}
    </div>
  </div>
);

export default OfferDetailMedia;
