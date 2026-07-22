import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import { offerTermsData } from '@/components/data/offerTermsData';

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
 * an empty page, so the route never has to 404 over missing products.
 * @param   {object}            props        - Component properties
 * @param   {string}            props.title  - Page heading (CMS title or fallback)
 * @param   {IProductsEntity[]} props.offers - Offer products to render
 * @returns {JSX.Element}                    Offers page body
 */
const OffersPageContent = ({
  title,
  offers,
}: {
  title: string;
  offers: IProductsEntity[];
}): JSX.Element => (
  <div className="bg-white" data-testid="offers-page">
    {/* Gradient accent strip */}
    <div className="h-1.25 bg-gradient-stats" />

    {/* Back link */}
    <div className="mx-auto max-w-7xl px-3 pt-6 md:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-opacity hover:opacity-70"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </div>

    {/* Heading */}
    <RevealAnimations className="mx-auto max-w-7xl px-3 pt-8 pb-2 text-center md:px-8">
      <h1
        className="inline-block border-b border-ink pb-2 font-light tracking-fine text-ink uppercase"
        style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
      >
        {title}
      </h1>
    </RevealAnimations>

    {/* Offer details */}
    <div
      className="mx-auto flex max-w-7xl flex-col gap-8 px-3 py-10 md:px-8"
      data-testid="offers-list"
    >
      {offers.length > 0 ? (
        offers.map((offer, index) => (
          <OfferDetailCard key={offer.id} product={offer} index={index} />
        ))
      ) : (
        <p
          className="text-center text-base text-neutral-300"
          data-testid="offers-empty"
        >
          No special offers available right now — check back soon.
        </p>
      )}
    </div>

    {/* Terms */}
    <RevealAnimations className="mx-auto max-w-7xl px-3 pb-16 md:px-8">
      <div className="rounded-2xl p-6" style={{ background: '#f7f7fb' }}>
        <p className="mb-3 text-sm font-black tracking-widest text-ink uppercase">
          Good to know
        </p>
        <ul className="space-y-2">
          {offerTermsData.map((term) => (
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
  </div>
);

export default OffersPageContent;
