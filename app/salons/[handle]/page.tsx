import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';
import SalonPageContent from '@/components/layout/salon-page';
import {
  DEFAULT_SALON_CONTENT,
  SALON_COLOR,
  SALON_CONTENT,
} from '@/components/layout/salon-page/salonContent';
import type { SalonDetail } from '@/components/layout/salon-page/types';
import { formatUaePhone } from '@/components/utils';

import getLocalGalleryItems from '../../gallery/getLocalGalleryItems';

/**
 * Salon detail page (`/salons/downtown`, `/salons/marina`, `/salons/jbr`).
 *
 * Ported from the static-html mock (`SalonPage.tsx`). Address/phone come from
 * the CMS salon page (`salon_address` / `salon_phone`); the photo gallery is
 * built from the local photo library filtered to this salon, and the About /
 * highlights / accent color come from local content (`salonContent.ts`) until
 * they move to the CMS. 404s only when the salon page itself is missing.
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

  /** The salon page and the photo scan are independent — run in parallel. */
  const [{ page, isError }, items] = await Promise.all([
    getPageByUrl(handle),
    getLocalGalleryItems(),
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

  /** Photos for this salon from the local library (fallback: any photos). */
  const salonPhotos = items
    .filter((item) => item.salon.toLowerCase() === handle.toLowerCase())
    .map((item) => item.url);
  const photos = (
    salonPhotos.length > 0 ? salonPhotos : items.map((item) => item.url)
  ).slice(0, 9);

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
  const { page, isError } = await getPageByUrl(handle);

  if (isError || !page) {
    return {};
  }

  const { localizeInfos } = page;
  return {
    title: localizeInfos?.title,
    description: localizeInfos?.plainValue || localizeInfos?.title,
    openGraph: {
      type: 'article',
      title: localizeInfos?.title,
      description: localizeInfos?.plainValue || localizeInfos?.title,
    },
  };
}
