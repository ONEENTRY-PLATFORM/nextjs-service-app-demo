import type { Metadata } from 'next';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getProductsByPageUrl } from '@/app/api/server/products/getProductsByPageUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import OffersPageContent from '@/components/layout/offers-page';
import { isOfferProduct } from '@/components/utils/isOfferProduct';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 60;

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
  const [dict, { page }, { products }] = await Promise.all([
    getDictionary(),
    getPageByUrl('offers'),
    /**
     * Offer products live on the `offers` page. `servicesOnly: false` skips the
     * catalog "has an `sku`" filter — offers carry `offer_sku`, not `sku`.
     */
    getProductsByPageUrl({
      limit: 100,
      offset: 0,
      servicesOnly: false,
      params: { handle: 'offers' },
    }),
  ]);
  ServerProvider('dict', dict);

  /**
   * A missing or errored `offers` page only drops the custom heading — the page
   * still renders with the fallback title, and an empty product list shows the
   * "no offers" state. A transient CMS failure must not 404 this static route.
   */
  const title = page?.localizeInfos?.title || 'Special Offers';

  /** Keep only genuine offer products, ignoring anything else on the page. */
  const offers = (products ?? []).filter(isOfferProduct);

  return <OffersPageContent title={title} offers={offers} />;
};

export default OffersPageLayout;

/**
 * Generate page metadata
 * @async
 * @returns {Promise<Metadata>} metadata
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    pageUrl: 'offers',
    path: '/offers',
  });
}
