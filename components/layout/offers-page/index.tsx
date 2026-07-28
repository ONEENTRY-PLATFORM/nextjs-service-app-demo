import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import type { BookingData } from '@/components/layout/booking-page/types';
import { dictText } from '@/components/utils/dictText';

import OfferDetailCard from './OfferDetailCard';

/**
 * Brand accent of the terms bullets. Kept as a raw hex because it is applied to
 * an inline-sized dot rather than text, where a token class has nothing to hook
 * onto; the page's text colours are `text-slate-400` / `text-ink` classes.
 */
const PINK = '#ed21f1';

/**
 * OffersPageContent — the body of `/offers` (mock `OffersPage.tsx`): back link,
 * underlined heading, the full-width offer cards and the "Good to know" terms.
 *
 * `offers-page` was one of the areas that had no `index.tsx`, so this whole tree
 * lived in the route file. The route now only reads the CMS and picks the title.
 *
 * Degrades on its own: an empty list renders the "no offers" state rather than
 * an empty page, so the route never has to 404 over missing products. Empty
 * `terms` (CMS content missing or unreadable) simply hide the "Good to know"
 * block — same pattern as the opening-hours column of the footer.
 * @param   {object}            props             - Component properties
 * @param   {string}            props.title       - Page heading (CMS title or fallback)
 * @param   {IProductsEntity[]} props.offers      - Offer products to render
 * @param   {string[]}          props.terms       - "Good to know" lines parsed from the CMS page content
 * @param   {BookingData}       props.bookingData - Salons / services / specialists the offer booking modal runs on
 * @returns {JSX.Element}                         Offers page body
 */
const OffersPageContent = ({
  title,
  offers,
  terms,
  bookingData,
}: {
  title: string;
  offers: IProductsEntity[];
  terms: string[];
  bookingData: BookingData;
}): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');
  return (
    <div className="bg-white" data-testid="offers-page">
      {/* Gradient accent strip */}
      <div className="h-1.25 bg-gradient-stats" />

      {/* Back link */}
      <div className="page-shell pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} />{' '}
          {dictText(dict, 'back_to_home_text', 'Back to Home')}
        </Link>
      </div>

      {/* Heading */}
      <RevealAnimations className="page-shell pt-8 pb-2 text-center">
        <h1
          className="inline-block border-b border-ink pb-2 font-light tracking-fine text-ink uppercase"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
        >
          {title}
        </h1>
      </RevealAnimations>

      {/* Offer details */}
      <div
        className="page-shell flex flex-col gap-8 py-10"
        data-testid="offers-list"
      >
        {offers.length > 0 ? (
          offers.map((offer, index) => (
            <OfferDetailCard
              key={offer.id}
              product={offer}
              index={index}
              bookingData={bookingData}
            />
          ))
        ) : (
          <p
            className="text-center text-base text-neutral-300"
            data-testid="offers-empty"
          >
            {dictText(
              dict,
              'no_offers_text',
              'No special offers available right now — check back soon.',
            )}
          </p>
        )}
      </div>

      {/* Terms */}
      {terms.length > 0 && (
        <RevealAnimations className="page-shell pb-16">
          <div className="rounded-2xl p-6" style={{ background: '#f7f7fb' }}>
            <p className="mb-3 text-sm font-black tracking-widest text-ink uppercase">
              {dictText(dict, 'offer_good_to_know_text', 'Good to know')}
            </p>
            <ul className="space-y-2">
              {terms.map((term) => (
                <li
                  key={term}
                  className="flex items-start gap-2.5 text-sm text-slate-400"
                >
                  <span
                    className="mt-1.5 inline-block shrink-0 rounded-full"
                    style={{ width: 5, height: 5, background: PINK }}
                  />
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </RevealAnimations>
      )}
    </div>
  );
};

export default OffersPageContent;
