import type { Metadata } from 'next';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api';
import GalleryPageContent from '@/components/layout/gallery-page';
import type { GalleryMainCategory } from '@/components/layout/gallery-page/taxonomy';
import { GALLERY_MAIN_CATS } from '@/components/layout/gallery-page/taxonomy';

import getLocalGalleryItems from './getLocalGalleryItems';

/**
 * Gallery page following the static-html mock (`GalleryPage.tsx`): gradient
 * accent strip, Service/Specialist filter block, full-bleed photo grid and a
 * lightbox.
 *
 * Photos are currently read from the local library in
 * `public/images/Beauty content/Gallery/` (see `getLocalGalleryItems`) —
 * the CMS gallery tree is not populated yet (content plan, stage 5). The
 * page never 404s over missing photos: the grid degrades to an empty-state
 * message.
 * @param   {object}                       props              - Page properties
 * @param   {Promise<{category?: string}>} props.searchParams - Optional `?category=HAIR|FACE|BODY|NAILS` to open a main category
 * @returns {Promise<JSX.Element>}                            JSX.Element representing the gallery page
 */
const GalleryPageLayout = async ({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<JSX.Element> => {
  /** Query params and the photo scan are independent — run in parallel. */
  const [{ category }, items] = await Promise.all([
    searchParams,
    getLocalGalleryItems(),
  ]);

  /** Accept only a known main category from the query string */
  const initialCategory = GALLERY_MAIN_CATS.some((cat) => cat.id === category)
    ? (category as GalleryMainCategory)
    : undefined;

  return (
    <div className="flex w-full flex-col bg-white">
      {/* Gradient accent strip */}
      <div className="h-1.25 bg-gradient-stats" />
      <GalleryPageContent items={items} initialCategory={initialCategory} />
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
  /** get page by Url */
  const { page, isError } = await getPageByUrl('gallery');

  if (isError || !page) {
    return {};
  }

  /** extract data from page */
  const { localizeInfos } = page;

  return {
    title: localizeInfos?.title,
    description: localizeInfos?.title,
    openGraph: {
      type: 'article',
    },
  };
}
