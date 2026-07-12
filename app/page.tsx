import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';
import { cache } from 'react';

import { getBlocksByPageUrl, getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { sortArrayByPosition } from '@/components/utils';

/**
 * `getPageByUrl('home')` is called from `generateMetadata`, the layout, and
 * `generateStructuredData`. React's `cache()` dedupes them within a single
 * request so the SDK is hit once.
 */
const getHomePage = cache(() => getPageByUrl('home'));

const HomeHero = dynamic(() => import('@/components/layout/home-hero'), {
  ssr: true,
});

const CatalogSection = dynamic(
  () => import('@/components/layout/catalog-grid'),
  { ssr: true },
);

const GalleryFeed = dynamic(() => import('@/components/layout/gallery-feed'), {
  ssr: true,
});

const HomeCtaBanner = dynamic(
  () => import('@/components/layout/home-cta-banner'),
  { ssr: true },
);

const ReviewsCarousel = dynamic(
  () => import('@/components/layout/reviews-carousel'),
  { ssr: true },
);

const MastersFeed = dynamic(() => import('@/components/layout/masters-feed'), {
  ssr: true,
});

const OffersFeed = dynamic(() => import('@/components/layout/offers-feed'), {
  ssr: true,
});

// export const revalidate = 10;
// export const dynamicParams = true;

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
      page.localizeInfos?.plainValue ||
      page.localizeInfos?.title ||
      'OneEntry next-js Beauty description',
    openGraph: {
      type: 'website',
      title: page.localizeInfos?.title || 'OneEntry Beauty',
      description:
        page.localizeInfos?.plainValue ||
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
      page.localizeInfos?.plainValue ||
      page.localizeInfos?.title ||
      'OneEntry next-js Beauty description',
    url: process.env.NEXT_PUBLIC_ONEENTRY_URL || 'https://oneentry.cloud',
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
  const [dict, { page, isError }, { blocks }, structuredData] =
    await Promise.all([
      getDictionary(),
      getHomePage(),
      getBlocksByPageUrl({ pageUrl: 'home' }),
      generateStructuredData(),
    ]);

  /** Set dictionary for localization */
  ServerProvider('dict', dict);

  /** The page marker is enough to render; blocks and lists are optional. */
  if (isError || !page) {
    return <>isError</>;
  }

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
            __html: JSON.stringify(structuredData),
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
      <HomeCtaBanner />
      {/* 6. Our specialists */}
      <MastersFeed block={blockByMarker.get('home_masters')} />
      {/* 7. Reviews */}
      <ReviewsCarousel />
    </>
  );
};

export default IndexPageLayout;
