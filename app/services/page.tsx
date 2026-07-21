import type { Metadata } from 'next';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { pageOpenGraph } from '@/app/utils/pageOpenGraph';
import PromoBanner from '@/components/layout/services-page/PromoBanner';
import ServicesCatalog from '@/components/layout/services-page/ServicesCatalog';
import ServicesHero from '@/components/layout/services-page/ServicesHero';

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
  const [dict, { page }, { categories, salons, services }] = await Promise.all([
    getDictionary(),
    getPageByUrl('services'),
    getServicesCatalogData(),
  ]);
  ServerProvider('dict', dict);

  /**
   * A missing or errored `services` page only drops the custom heading — the
   * hero, catalog (with its own empty state) and promo banner still render. A
   * transient CMS failure must not 404 this static route.
   */
  const title = page?.localizeInfos?.title ?? 'Services & Prices';
  /** Stats line under the hero title — only when the CMS has services */
  const subtitle =
    services.length > 0
      ? `${services.length} services · ${salons.length || 3} locations across Dubai`
      : undefined;
  /** Counter pairs for the hero strip — only when the CMS has services */
  const stats: Array<[string | number, string]> | undefined =
    services.length > 0
      ? [
          [services.length, 'Services'],
          [salons.length, 'Locations'],
          [categories.length, 'Categories'],
        ]
      : undefined;

  return (
    <>
      <ServicesHero title={title} subtitle={subtitle} stats={stats} />
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
    description: getPagePlainContent(page) || localizeInfos?.title,
    alternates: { canonical: '/services' },
    openGraph: {
      ...(await pageOpenGraph('/services')),
      type: 'article',
    },
  };
}
