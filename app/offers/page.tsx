import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import {
  getChildPagesByParentUrl,
  getPageByUrl,
  getProductsByPageUrl,
} from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { offerTermsData } from '@/components/data';
import OfferDetailCard from '@/components/layout/offers-page/OfferDetailCard';

/** Brand text colors from the static-html mock (`OffersPage.tsx`) */
const DARK = '#4c4d56';
const PINK = '#ed21f1';

/**
 * Collect special offers (`offer` products) from every service
 * category and subcategory, keeping the CMS category order. Fetch failures
 * degrade to an empty list — the page renders a fallback message instead of
 * a 404.
 * @returns {Promise<IProductsEntity[]>} Flat list of offer products
 */
const getOffers = async (): Promise<IProductsEntity[]> => {
  const { pages } = await getChildPagesByParentUrl('services');
  const categories = pages ?? [];

  const buckets = await Promise.all(
    categories.map(async (category) => {
      /** Products can live on the category page or on its subcategories */
      const { pages: subPages } = await getChildPagesByParentUrl(
        category.pageUrl,
      );
      const handles = [
        category.pageUrl,
        ...(subPages ?? []).map((sub) => sub.pageUrl),
      ];
      const lists = await Promise.all(
        handles.map((handle) =>
          getProductsByPageUrl({
            limit: 100,
            offset: 0,
            params: { handle },
          }).then((result) => result.products ?? []),
        ),
      );
      const seen = new Set<number>();
      return lists
        .flat()
        .filter(
          (product) =>
            product.attributeSetIdentifier === 'offer' &&
            !seen.has(product.id) &&
            (seen.add(product.id) || true),
        );
    }),
  );

  return buckets.flat();
};

/**
 * OffersPageLayout component renders the special offers page following the
 * static-html mock (`OffersPage.tsx`): gradient accent strip, "Back to Home"
 * link, underlined page heading, full-width offer detail cards and the
 * "Good to know" terms block.
 *
 * Offers are optional — while the CMS holds no `offer` products the
 * page renders the heading, a fallback message and the terms instead of a
 * 404.
 * @returns {Promise<JSX.Element>} JSX element representing the offers page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
const OffersPageLayout = async (): Promise<JSX.Element> => {
  /** All three fetches are independent — run in parallel. */
  const [dict, { page, isError }, offers] = await Promise.all([
    getDictionary(),
    getPageByUrl('offers'),
    getOffers(),
  ]);
  ServerProvider('dict', dict);

  if (!page || isError) {
    return notFound();
  }

  const title = page.localizeInfos?.title ?? 'Special Offers';

  return (
    <div className="bg-white">
      {/* Gradient accent strip */}
      <div className="h-1.25 bg-gradient-stats" />

      {/* Back link */}
      <div className="mx-auto max-w-7xl px-3 pt-6 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: DARK }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      {/* Heading */}
      <div className="mx-auto max-w-7xl px-3 pt-8 pb-2 text-center md:px-8">
        <h1
          className="inline-block border-b border-ink pb-2 font-light tracking-fine text-ink uppercase"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
        >
          {title}
        </h1>
      </div>

      {/* Offer details */}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-3 py-10 md:px-8">
        {offers.length > 0 ? (
          offers.map((offer, index) => (
            <OfferDetailCard key={offer.id} product={offer} index={index} />
          ))
        ) : (
          <p className="text-center text-base text-neutral-300">
            No special offers available right now — check back soon.
          </p>
        )}
      </div>

      {/* Terms */}
      <div className="mx-auto max-w-7xl px-3 pb-16 md:px-8">
        <div className="rounded-2xl p-6" style={{ background: '#f7f7fb' }}>
          <p className="mb-3 text-sm font-black tracking-widest text-ink uppercase">
            Good to know
          </p>
          <ul className="space-y-2">
            {offerTermsData.map((term) => (
              <li
                key={term}
                className="flex items-start gap-2.5 text-sm"
                style={{ color: DARK }}
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
      </div>
    </div>
  );
};

export default OffersPageLayout;

/**
 * Generate page metadata
 * @async
 * @returns {Promise<Metadata>} metadata
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata(): Promise<Metadata> {
  /** get page by Url */
  const { page, isError } = await getPageByUrl('offers');
  if (isError || !page) {
    return {};
  }

  /** extract data from page */
  const { localizeInfos } = page;

  return {
    title: localizeInfos?.title,
    description: localizeInfos?.plainValue,
    openGraph: {
      type: 'article',
    },
  };
}
