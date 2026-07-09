import type { Metadata } from 'next';
import type { JSX } from 'react';

import LineAnimations from '@/app/animations/LineAnimations';
import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import Gallery from '@/components/layout/gallery-grid';

/**
 * GallerySingleLayout
 * @param   {object}                    props        - GallerySingleLayout props.
 * @param   {Promise<{handle: string}>} props.params - page params.
 * @returns {Promise<JSX.Element>}                   GalleryGrid layout.
 */
export default async function GallerySingleLayout({
  params,
}: {
  params: Promise<{
    handle: string;
  }>;
}): Promise<JSX.Element> {
  const { handle } = await params;
  /** Dict and page reads are independent — run in parallel. */
  const [dictionary, pageResult] = await Promise.all([
    getDictionary(),
    getPageByUrl(handle),
  ]);
  const [dict] = ServerProvider('dict', dictionary);
  const { page, isError } = pageResult;

  /** Generate structured data for gallery */
  const structuredData =
    !isError && page
      ? {
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: page.localizeInfos?.title,
          description:
            page.localizeInfos?.plainValue || page.localizeInfos?.title,
          url: `${process.env.NEXT_PUBLIC_ONEENTRY_URL || 'https://oneentry.cloud'}/gallery/${handle}`,
        }
      : null;

  return (
    <section className="flex min-h-[50vh] w-full flex-col justify-center">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      <div className="mx-auto flex w-full flex-col">
        <LineAnimations className="gradient-bg-line-20" delay={0} />
        <Gallery dict={dict} handle={handle} />
      </div>
    </section>
  );
}

/**
 * Pre-generation of pages
 * @returns {Promise<Array<{handle: string}>>} Array of page parameters
 */
export async function generateStaticParams() {
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
