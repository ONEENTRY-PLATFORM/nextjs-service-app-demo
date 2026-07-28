import type { Metadata } from 'next';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import GalleryPageContent from '@/components/layout/gallery-page';
import GalleryUnavailable from '@/components/layout/gallery-page/components/GalleryUnavailable';
import type { GalleryMainCategory } from '@/components/layout/gallery-page/taxonomy';
import { GALLERY_MAIN_CATS } from '@/components/layout/gallery-page/taxonomy';

import getCmsGalleryItems from './utils/getCmsGalleryItems';

/**
 * ISR: refresh the prerendered CMS content on a timer. Not `force-static` —
 * this route reads request-time data (searchParams) or has no static params.
 */
export const revalidate = 60;

/**
 * Gallery page.
 *
 * Photos come from the OneEntry gallery tree (`getCmsGalleryItems`); when the
 * CMS gallery is empty the grid degrades to an empty-state message (no 404).
 * @param   {object}                       props              - Page properties
 * @param   {Promise<{category?: string}>} props.searchParams - Optional `?category=HAIR|FACE|BODY|NAILS` to open a main category
 * @returns {Promise<JSX.Element>}                            JSX.Element representing the gallery page
 */
const GalleryPageLayout = async ({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<JSX.Element> => {
  /** Query params and the CMS reads are independent — run in parallel. */
  const [{ category }, items, pageResult] = await Promise.all([
    searchParams,
    getCmsGalleryItems(),
    getPageByUrl('gallery'),
  ]);

  /**
   * The `gallery` page entity feeds only the (visually hidden) `h1` and is
   * never gated on — `getPageByUrl` reports failures in its envelope, so a
   * missing or unreachable page degrades to the fallback heading.
   */
  const heading = pageResult.page?.localizeInfos?.title || 'Gallery';

  /** Accept only a known main category from the query string */
  const initialCategory = GALLERY_MAIN_CATS.some((cat) => cat.id === category)
    ? (category as GalleryMainCategory)
    : undefined;

  return (
    <div className="flex w-full flex-col bg-white">
      {/* The design opens with the filter bar — the h1 is for a11y/SEO only */}
      <h1 className="sr-only">{heading}</h1>
      {/* Gradient accent strip */}
      <div className="h-1.25 bg-gradient-stats" />
      {items.length > 0 ? (
        <GalleryPageContent items={items} initialCategory={initialCategory} />
      ) : (
        <GalleryUnavailable />
      )}
    </div>
  );
};

export default GalleryPageLayout;

/**
 * Generate page metadata for the gallery page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 * @returns {Promise<Metadata>} - Metadata for the gallery page
 */
export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    pageUrl: 'gallery',
    path: '/gallery',
  });
}
