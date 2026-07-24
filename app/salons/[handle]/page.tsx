import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
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
 *
 * Ported from the static-html mock (`SalonPage.tsx`). Address/phone come from
 * the CMS salon page (`salon_address` / `salon_phone`); the photos are the
 * salon's own pictures from its `salon_images` (`groupOfImages`) attribute —
 * the venue itself, not work from the gallery. The About paragraphs and
 * highlight bullets are read from the page's rich-text body (`htmlContent`),
 * falling back to local `salonContent.ts` copy when the CMS body is empty. Only
 * the accent color stays local. 404s only when the salon page itself is missing.
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

  const { page, isError } = await getPageByUrl(handle);

  if (!page || isError) {
    return notFound();
  }

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
