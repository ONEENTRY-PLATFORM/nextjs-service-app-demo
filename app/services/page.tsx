import type { Metadata } from 'next';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import ServicesPageContent from '@/components/layout/services-page';

import { getServicesCatalogData } from './catalog-data';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 60;

/**
 * ServicesPageLayout component renders the "Services & Prices" page.
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
   * body degrades on its own. A transient CMS failure must not 404 this static
   * route, which is why this one never calls `notFound()`.
   */
  return (
    <ServicesPageContent
      page={page}
      categories={categories}
      salons={salons}
      services={services}
    />
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
  return cmsPageMetadata({
    pageUrl: 'services',
    path: '/services',
  });
}
