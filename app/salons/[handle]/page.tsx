import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import { resolveCmsPage } from '@/app/utils/resolveCmsPage';
import { salonMapLinks } from '@/app/utils/salonMapLinks';
import SalonPageContent from '@/components/layout/salon-page';
import { SALON_COLOR } from '@/components/layout/salon-page/salonContent';
import type { SalonDetail } from '@/components/layout/salon-page/types';
import { salonContentFromPage } from '@/components/layout/salon-page/utils/salonContentFromPage';
import { salonPhotosFromPage } from '@/components/layout/salon-page/utils/salonPhotosFromPage';
import { formatUaePhone } from '@/components/utils/formatUaePhone';
import { salonFromPage } from '@/components/utils/salonFromPage';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

/**
 * Salon detail page (`/salons/downtown`, `/salons/marina`, `/salons/jbr`).
 * @param   {object}                      props        - Page properties
 * @param   {Promise<{ handle: string }>} props.params - Route params (salon `pageUrl`)
 * @returns {Promise<JSX.Element>}                     Salon detail page
 */
export default async function SalonDetailLayout({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<JSX.Element> {
  const { handle } = await params;

  const resolved = await resolveCmsPage(handle);

  /**
   * Only a genuine 404 from the CMS means this salon does not exist. A CMS
   * outage used to take the same branch, freezing a 404 for the whole
   * revalidate window on this `force-static` route.
   */
  if (resolved.status === 'missing') {
    return notFound();
  }

  /**
   * Every field of the detail below is built from the CMS entity, so there is
   * nothing to degrade to. Throwing reaches the error boundary (retry) on a
   * cache miss, and a failed background regeneration keeps serving the last
   * valid version.
   */
  if (resolved.status === 'unavailable') {
    throw new Error(
      `/salons/${handle}: CMS is unavailable — rendering the error boundary instead of baking a 404 into ISR`,
    );
  }

  const { page } = resolved;

  const salon = salonFromPage(page);
  const links = salonMapLinks(salon);

  /** The salon's own photos, from its `salon_images` attribute. */
  const photos = salonPhotosFromPage(page);

  /** About paragraphs and highlight bullets, read from the CMS page body. */
  const { about, highlights } = salonContentFromPage(page);

  const detail: SalonDetail = {
    name: salon.name,
    address: salon.address,
    phone: formatUaePhone(salon.phone),
    ...links,
    color: SALON_COLOR[handle] ?? '#ed21f1',
    about,
    highlights,
    photos,
  };

  return <SalonPageContent salon={detail} />;
}

/**
 * Pre-generation of salon detail pages — the child pages of `salons`.
 * @returns {Promise<Array<{ handle: string }>>} Array of salon page params
 */
export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const { pages, isError } = await getChildPagesByParentUrl('salons');

  if (!isError && pages) {
    return pages.map((page: { pageUrl: string }) => ({
      handle: page.pageUrl,
    }));
  }

  return [];
}

/**
 * Generate page metadata for a salon detail page.
 * @param   {object}                      props        - Page properties
 * @param   {Promise<{ handle: string }>} props.params - Route params
 * @returns {Promise<Metadata>}                        Metadata
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return cmsPageMetadata({ pageUrl: handle, path: `/salons/${handle}` });
}
