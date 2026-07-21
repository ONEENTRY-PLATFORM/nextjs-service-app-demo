import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import { serializeJsonLd } from '@/app/utils/serializeJsonLd';
import GalleryPageContent from '@/components/layout/gallery-page';
import GalleryUnavailable from '@/components/layout/gallery-page/components/GalleryUnavailable';
import type { GalleryMainCategory } from '@/components/layout/gallery-page/taxonomy';
import { GALLERY_MAIN_CATS } from '@/components/layout/gallery-page/taxonomy';

import getCmsGalleryItems from '../getCmsGalleryItems';

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
 * Mirrors the static-html mock, where the gallery is a single unified page: this
 * route renders the very same ported {@link GalleryPageContent} as `/gallery`,
 * only with the requested category pre-selected (like `/services/hair`).
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
  /** The page read and the CMS gallery fetch are independent — run in parallel. */
  const [{ page, isError }, items] = await Promise.all([
    getPageByUrl(handle),
    getCmsGalleryItems(),
  ]);

  if (!page || isError) {
    return notFound();
  }

  const initialCategory = handleToCategory(handle);

  /** Generate structured data for gallery */
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: page.localizeInfos?.title,
    description: getPagePlainContent(page) || page.localizeInfos?.title,
    url: `${getSiteUrl()}/gallery/${handle}`,
  };

  return (
    <div className="flex w-full flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
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
  /** get page by Url */
  const { page, isError } = await getPageByUrl(handle);

  if (isError || !page) {
    return {};
  }

  /** extract data from page */
  const { localizeInfos } = page;
  const description = getPagePlainContent(page) || localizeInfos?.title;

  return {
    title: localizeInfos?.title,
    description,
    openGraph: {
      type: 'article',
      title: localizeInfos?.title,
      description,
    },
  };
}
