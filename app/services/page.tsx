import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import PromoBanner from '@/components/layout/services-page/PromoBanner';
import ServicesCatalog from '@/components/layout/services-page/ServicesCatalog';
import ServicesHero from '@/components/layout/services-page/ServicesHero';
import StatsStrip from '@/components/layout/services-page/StatsStrip';

import { getServicesCatalogData } from './catalog-data';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 60;

/**
 * ServicesPageLayout component renders the "Services & Prices" page following
 * the static-html mock (`PricesPage.tsx`): photo hero with the page title,
 * gradient stats strip, the interactive catalog (salon selector, search,
 * category/subcategory tabs, service cards) and the "First Visit" promo
 * banner.
 *
 * The catalog data is optional — while the CMS holds no categories/products
 * the page still renders with the hero, an empty catalog and the promo
 * banner instead of a 404.
 * @returns {Promise<JSX.Element>} JSX element representing the services page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
const ServicesPageLayout = async (): Promise<JSX.Element> => {
  /** All three fetches are independent — run in parallel. */
  const [dict, { page, isError }, { categories, salons, services }] =
    await Promise.all([
      getDictionary(),
      getPageByUrl('services'),
      getServicesCatalogData(),
    ]);
  ServerProvider('dict', dict);

  if (!page || isError) {
    return notFound();
  }

  const title = page.localizeInfos?.title ?? 'Services & Prices';
  /** Stats line under the hero title — only when the CMS has services */
  const subtitle =
    services.length > 0
      ? `${services.length} services · ${salons.length || 3} locations across Dubai`
      : undefined;

  return (
    <>
      <ServicesHero title={title} subtitle={subtitle} />
      {services.length > 0 && (
        <StatsStrip
          stats={[
            [services.length, 'Services'],
            [salons.length, 'Locations'],
            [categories.length, 'Categories'],
          ]}
        />
      )}
      <ServicesCatalog
        categories={categories}
        salons={salons}
        services={services}
      />
      <PromoBanner />
    </>
  );
};

export default ServicesPageLayout;

/**
 * Generate page metadata
 * @async
 * @returns {Promise<Metadata>} metadata
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata(): Promise<Metadata> {
  /** get page by Url */
  const { page, isError } = await getPageByUrl('services');
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
