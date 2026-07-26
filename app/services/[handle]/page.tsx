import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import { resolveCmsPage } from '@/app/utils/resolveCmsPage';
import ServicesPageContent from '@/components/layout/services-page';
import JsonLd from '@/components/shared/JsonLd';
import { dictText } from '@/components/utils/dictText';

import { getServicesCatalogData } from '../catalog-data';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 60;

/**
 * Category service page (`/services/hair`, `/services/haircut`, …).
 * @param   {object}                      props        - page props.
 * @param   {Promise<{ handle: string }>} props.params - page params.
 * @returns {Promise<JSX.Element>}                     ServicePage.
 */
export default async function ServicePageLayout({
  params,
}: {
  params: Promise<{
    handle: string;
  }>;
}): Promise<JSX.Element> {
  const { handle } = await params;

  /** Dict, the page itself and the full catalog are independent — parallel. */
  const [dict, resolved, { categories, salons, services }] = await Promise.all([
    getDictionary(),
    resolveCmsPage(handle),
    getServicesCatalogData(),
  ]);
  ServerProvider('dict', dict);

  /**
   * Only a genuine 404 from the CMS means this category does not exist. A CMS
   * outage used to take the same branch, freezing a 404 for the whole revalidate
   * window on this `force-static` route; now it degrades to the catalog with a
   * fallback heading, which the page already knows how to render.
   */
  if (resolved.status === 'missing') {
    return notFound();
  }
  const page = resolved.status === 'ok' ? resolved.page : undefined;

  /**
   * Resolve which tab the catalog should open on. `handle` is either a
   * top-level category (`hair`) or a subcategory (`haircut`); for the latter we
   * pre-select its parent category plus the subcategory itself.
   */
  const isCategory = categories.some((c) => c.url === handle);
  const parentCategory = categories.find((c) =>
    c.subcategories.some((s) => s.url === handle),
  );
  const initialCategory = isCategory ? handle : parentCategory?.url;
  const initialSubcategory = isCategory ? undefined : handle;

  /**
   * Provider name for the structured data — the site name from the CMS
   * dictionary (same source as the Organization JSON-LD in the root layout),
   * so Service and Organization markup agree. Falls back to the brand name.
   */
  const siteName = dictText(dict, 'site_name', 'Thalia Beauty Studio');

  /**
   * Structured data for the service. Emitted only when the CMS page really was
   * read — describing a page with a fallback title while the CMS is down would
   * publish placeholder markup to crawlers.
   */
  const structuredData = page
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: page.localizeInfos?.title,
        description: getPagePlainContent(page) || page.localizeInfos?.title,
        provider: {
          '@type': 'Organization',
          name: siteName,
        },
        url: `${getSiteUrl()}/services/${handle}`,
      }
    : null;

  return (
    <>
      <JsonLd data={structuredData} />
      <ServicesPageContent
        page={page}
        categories={categories}
        salons={salons}
        services={services}
        resetKey={handle}
        {...(initialCategory ? { initialCategory } : {})}
        {...(initialSubcategory ? { initialSubcategory } : {})}
      />
    </>
  );
}

/**
 * Pre-generation of page — every category and subcategory under `services`.
 * @returns {Promise<Array<{ handle: string }>>} Array of static paths with handle parameters
 */
export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const { pages, isError } = await getChildPagesByParentUrl('services');
  const params: Array<{ handle: string }> = [];

  if (!isError && pages) {
    /** Categories plus their subcategories share the same catalog route */
    const subLists = await Promise.all(
      pages.map((category) => getChildPagesByParentUrl(category.pageUrl)),
    );
    pages.forEach((page, index) => {
      params.push({ handle: page.pageUrl });
      subLists[index]?.pages?.forEach((sub) => {
        params.push({ handle: sub.pageUrl });
      });
    });
  }

  return params;
}

/**
 * Generate page metadata.
 * @param   {object}                      props        - page props.
 * @param   {Promise<{ handle: string }>} props.params - page params.
 * @returns {Promise<Metadata>}                        metadata.
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    handle: string;
  }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return cmsPageMetadata({ pageUrl: handle, path: `/services/${handle}` });
}
