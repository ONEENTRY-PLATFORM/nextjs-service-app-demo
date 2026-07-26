import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import { resolveCmsPage } from '@/app/utils/resolveCmsPage';
import GalleryPageContent from '@/components/layout/gallery-page';
import GalleryUnavailable from '@/components/layout/gallery-page/components/GalleryUnavailable';
import type { GalleryMainCategory } from '@/components/layout/gallery-page/taxonomy';
import { GALLERY_MAIN_CATS } from '@/components/layout/gallery-page/taxonomy';
import JsonLd from '@/components/shared/JsonLd';

import getCmsGalleryItems from '../utils/getCmsGalleryItems';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 60;

/**
 * Map a gallery category page handle (`gallery-hair`, `gallery-face`, …) onto a
 * main gallery filter (`HAIR`, `FACE`, …). Unknown handles open the default tab.
 * @param   {string}                        handle - `pageUrl` of the gallery category page
 * @returns {GalleryMainCategory|undefined}        Main category to pre-select, or `undefined`
 */
const handleToCategory = (handle: string): GalleryMainCategory | undefined => {
  const key = handle.replace(/^gallery-/, '').toUpperCase();
  return GALLERY_MAIN_CATS.some((cat) => cat.id === key)
    ? (key as GalleryMainCategory)
    : undefined;
};

/**
 * Gallery category page (`/gallery/gallery-hair`, …).
 *
 * @param   {object}                    props        - GallerySingleLayout props.
 * @param   {Promise<{handle: string}>} props.params - page params.
 * @returns {Promise<JSX.Element>}                   Gallery page pre-filtered by category.
 */
export default async function GallerySingleLayout({
  params,
}: {
  params: Promise<{
    handle: string;
  }>;
}): Promise<JSX.Element> {
  const { handle } = await params;
  /**
   * The page read and the CMS gallery fetch are independent — run in parallel.
   *
   * The photos must never decide the route's status code: they resolve in the
   * same `Promise.all` as the page read, so before the `.catch` a failing
   * gallery rejected the pair and Next answered **500 for an unknown category
   * that owed a 404** — the route never reached the `missing` branch below.
   */
  const [resolved, items] = await Promise.all([
    resolveCmsPage(handle),
    getCmsGalleryItems().catch(() => []),
  ]);

  /**
   * Only a genuine 404 means this category does not exist. A CMS outage used to
   * take the same branch and freeze a 404 for the whole revalidate window on
   * this `force-static` route; now it falls through to the gallery, which
   * already degrades to `GalleryUnavailable` when there are no photos.
   */
  if (resolved.status === 'missing') {
    return notFound();
  }
  const page = resolved.status === 'ok' ? resolved.page : undefined;

  const initialCategory = handleToCategory(handle);

  /**
   * Structured data for the gallery. Emitted only when the CMS page really was
   * read — describing it from nothing while the CMS is down would publish
   * placeholder markup to crawlers.
   */
  const structuredData = page
    ? {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: page.localizeInfos?.title,
        description: getPagePlainContent(page) || page.localizeInfos?.title,
        url: `${getSiteUrl()}/gallery/${handle}`,
      }
    : null;

  return (
    <div className="flex w-full flex-col bg-white">
      <JsonLd data={structuredData} />
      {/* Gradient accent strip */}
      <div className="h-1.25 bg-gradient-stats" />
      {items.length > 0 ? (
        <GalleryPageContent
          items={items}
          {...(initialCategory ? { initialCategory } : {})}
        />
      ) : (
        <GalleryUnavailable />
      )}
    </div>
  );
}

/**
 * Pre-generation of pages — the gallery category pages under `gallery`.
 * @returns {Promise<Array<{handle: string}>>} Array of page parameters
 */
export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const { pages, isError } = await getChildPagesByParentUrl('gallery');

  if (!isError && pages) {
    return pages.map((page: { pageUrl: string }) => ({
      handle: page.pageUrl,
    }));
  }

  return [];
}

/**
 * Generate page metadata
 * @param   {object}                    props        - parameters
 * @param   {Promise<{handle: string}>} props.params - page parameters with handle
 * @returns {Promise<Metadata>}                      metadata
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return cmsPageMetadata({ pageUrl: handle, path: `/gallery/${handle}` });
}
