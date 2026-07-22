import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import SalonPageContent from '@/components/layout/salon-page';
import {
  DEFAULT_SALON_CONTENT,
  SALON_COLOR,
  SALON_CONTENT,
} from '@/components/layout/salon-page/salonContent';
import type { SalonDetail } from '@/components/layout/salon-page/types';
import { formatUaePhone } from '@/components/utils/formatUaePhone';

import getCmsGalleryItems from '../../gallery/getCmsGalleryItems';

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
 * the CMS salon page (`salon_address` / `salon_phone`); the photo gallery is
 * the gallery filtered to this salon — photos are tagged through their master
 * (`master_id` → `master_salon`), so untagged ones simply do not show up. The
 * About / highlights / accent color come from local content (`salonContent.ts`)
 * until they move to the CMS. 404s only when the salon page itself is missing.
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

  /** The salon page and the gallery are independent — run in parallel. */
  const [{ page, isError }, items] = await Promise.all([
    getPageByUrl(handle),
    getCmsGalleryItems(),
  ]);

  if (!page || isError) {
    return notFound();
  }

  const attrs = page.attributeValues ?? {};
  const address = (attrs.salon_address?.value as string | undefined) ?? '';
  const phone = (attrs.salon_phone?.value as string | undefined) ?? '';
  const phoneFormatted = formatUaePhone(phone);
  const query = encodeURIComponent(
    address || (page.localizeInfos?.title ?? ''),
  );

  /**
   * Photos of this salon. A photo reaches its salon through its master, so
   * photos whose master has no salon carry no tag and are left out rather than
   * shown under an arbitrary salon.
   */
  const photos = items
    .filter((item) =>
      item.salon.some(
        (marker) => marker.toLowerCase() === handle.toLowerCase(),
      ),
    )
    .map((item) => ({ url: item.url, preview: item.preview }))
    .slice(0, 9);

  const content = SALON_CONTENT[handle] ?? DEFAULT_SALON_CONTENT;

  const salon: SalonDetail = {
    name: page.localizeInfos?.title ?? 'Salon',
    address,
    phone: phoneFormatted,
    tel: (phone || phoneFormatted).replace(/[^+\d]/g, ''),
    mapSrc: `https://www.google.com/maps?q=${query}&z=15&hl=en&output=embed`,
    mapsLink: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
    color: SALON_COLOR[handle] ?? '#ed21f1',
    about: content.about,
    highlights: content.highlights,
    photos,
  };

  return <SalonPageContent salon={salon} />;
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
