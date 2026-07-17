import { ChevronRight } from 'lucide-react';
import type { JSX } from 'react';

import CurrencySymbol from '@/components/shared/CurrencySymbol';

/** Brand text colors from the static-html mock */
const DARK = '#4c4d56';
const MUTED = '#a8a9b5';

/**
 * OfferCardFooter — the price block and "Book Offer" button of an offer card.
 * Featured cards invert to translucent-white controls over the accent
 * gradient; regular cards use the accent gradient on the button.
 * @param   {object}      props             - Component properties
 * @param   {boolean}     props.featured    - Featured (accent-gradient) card
 * @param   {string}      props.accentColor - Accent colour hex
 * @param   {string}      props.accentGrad  - Accent gradient
 * @param   {number}      props.price       - Current price
 * @param   {number}      props.original    - Crossed-out original price (`0` hides it)
 * @param   {string}      props.currency    - Currency symbol
 * @param   {() => void}  props.onBook      - Add the offer to the cart and go to booking
 * @returns {JSX.Element}                   Offer card footer
 */
const OfferCardFooter = ({
  featured,
  accentColor,
  accentGrad,
  price,
  original,
  currency,
  onBook,
}: {
  featured: boolean;
  accentColor: string;
  accentGrad: string;
  price: number;
  original: number;
  currency?: string | undefined;
  onBook: () => void;
}): JSX.Element => (
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
        <CurrencySymbol currency={currency} big /> {price}
      </span>
      {/* Old price */}
      {original > 0 && (
        <span
          className="mb-1 text-sm whitespace-nowrap line-through"
          style={{ color: featured ? 'rgba(255,255,255,0.55)' : MUTED }}
        >
          <CurrencySymbol currency={currency} />
          {original}
        </span>
      )}
    </div>
    <button
      data-testid="offer-book"
      onClick={(e) => {
        e.stopPropagation();
        onBook();
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
);

export default OfferCardFooter;
