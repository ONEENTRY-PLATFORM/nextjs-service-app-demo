import type { Metadata } from 'next';
// Aliased: the route-segment `export const dynamic` below owns the name `dynamic`.
import nextDynamic from 'next/dynamic';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';
import { cache } from 'react';

import { getBlocksByPageUrl } from '@/app/api/server/blocks/getBlocksByPageUrl';
import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import { pageOpenGraph } from '@/app/utils/pageOpenGraph';
import { serializeJsonLd } from '@/app/utils/serializeJsonLd';
import { sortArrayByPosition } from '@/components/utils';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

/**
 * `getPageByUrl('home')` is called from `generateMetadata`, the layout, and
 * `generateStructuredData`. React's `cache()` dedupes them within a single
 * request so the SDK is hit once.
 */
const getHomePage = cache(() => getPageByUrl('home'));

const HomeHero = nextDynamic(
  () => import('@/components/layout/home/home-hero'),
  {
    ssr: true,
  },
);

const CatalogSection = nextDynamic(
  () => import('@/components/layout/home/catalog-grid'),
  { ssr: true },
);

const GalleryFeed = nextDynamic(
  () => import('@/components/layout/home/gallery-feed'),
  {
    ssr: true,
  },
);

const HomeCtaBanner = nextDynamic(
  () => import('@/components/layout/home/home-cta-banner'),
  { ssr: true },
);

const ReviewsCarousel = nextDynamic(
  () => import('@/components/layout/home/reviews-carousel'),
  { ssr: true },
);

const MastersFeed = nextDynamic(
  () => import('@/components/layout/home/masters-feed'),
  {
    ssr: true,
  },
);

const OffersFeed = nextDynamic(
  () => import('@/components/layout/home/offers-feed'),
  {
    ssr: true,
  },
);

/**
 * Generate page metadata
 * @returns {Promise<Metadata>} metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const { page, isError } = await getHomePage();

  if (isError || !page) {
    return {
      title: 'OneEntry Beauty',
      description: 'OneEntry next-js Beauty description',
    };
  }

  return {
    title: page.localizeInfos?.title || 'OneEntry Beauty',
    description:
      getPagePlainContent(page) ||
      page.localizeInfos?.title ||
      'OneEntry next-js Beauty description',
    alternates: { canonical: '/' },
    openGraph: {
      ...(await pageOpenGraph('/')),
      type: 'website',
      title: page.localizeInfos?.title || 'OneEntry Beauty',
      description:
        getPagePlainContent(page) ||
        page.localizeInfos?.title ||
        'OneEntry next-js Beauty description',
    },
  };
}

/**
 * Generate structured data for the homepage
 * @returns {object} Structured data in JSON-LD format
 */
const generateStructuredData = async (): Promise<object> => {
  const { page, isError } = await getHomePage();

  if (isError || !page) {
    return {};
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: page.localizeInfos?.title || 'OneEntry Beauty',
    description:
      getPagePlainContent(page) ||
      page.localizeInfos?.title ||
      'OneEntry next-js Beauty description',
    url: getSiteUrl(),
  };
};

/**
 * IndexPageLayout component renders the home page by fetching page data and rendering appropriate blocks
 * @returns {Promise<JSX.Element>} Promise resolving to a JSX element representing the complete home page layout
 */
const IndexPageLayout = async (): Promise<JSX.Element> => {
  /**
   * Fetch dictionary, page, and blocks in parallel. The `home` page marker is
   * known up-front, so the blocks request does not need to wait for the page
   * request to resolve.
   */
  const [dict, { blocks }, structuredData] = await Promise.all([
    getDictionary(),
    getBlocksByPageUrl({ pageUrl: 'home' }),
    generateStructuredData(),
  ]);

  /** Set dictionary for localization */
  ServerProvider('dict', dict);

  /**
   * The site root NEVER 404s: the `home` page entity is not rendered here (only
   * its blocks are), and every section degrades to the mock's demo fallbacks
   * when its block is missing or the CMS errors. So we do not fetch `home` or
   * gate on it — a transient CMS failure or an unpopulated `home` page still
   * renders the designed layout instead of turning the whole site into a 404.
   */

  /**
   * Index the CMS blocks by their marker so the home page can render a fixed
   * section layout in the design order (static-html `HomePage.tsx`), passing
   * each section its block when present. Sections whose block is missing —
   * or whose CMS data is empty — degrade to the mock's demo fallbacks, so the
   * layout matches the design regardless of how much of the CMS is populated.
   */
  const sortedBlocks = sortArrayByPosition(blocks ?? []);
  const blockByMarker = new Map<string, IBlockEntity>();
  sortedBlocks?.forEach((block: IBlockEntity) => {
    if (block.identifier) {
      blockByMarker.set(block.identifier, block);
    }
  });
  const heroBlock = blockByMarker.get('home_hero');

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(structuredData),
          }}
        />
      )}
      {/* 1. Hero carousel banner */}
      {heroBlock && <HomeHero block={heroBlock} />}
      {/* 2. Service catalog */}
      <CatalogSection block={blockByMarker.get('home_catalog')} />
      {/* 3. Gallery strip */}
      <GalleryFeed block={blockByMarker.get('home_gallery')} />
      {/* 4. Best offers */}
      <OffersFeed block={blockByMarker.get('home_offers_feed')} />
      {/* 5. Booking CTA banner */}
      <HomeCtaBanner block={blockByMarker.get('home_discounts')} />
      {/* 6. Our specialists */}
      <MastersFeed block={blockByMarker.get('home_masters')} />
      {/* 7. Reviews */}
      <ReviewsCarousel />
    </>
  );
};

export default IndexPageLayout;
