import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import PromoBanner from '@/components/layout/services-page/PromoBanner';
import ServicesCatalog from '@/components/layout/services-page/ServicesCatalog';
import ServicesHero from '@/components/layout/services-page/ServicesHero';
import StatsStrip from '@/components/layout/services-page/StatsStrip';

import { getServicesCatalogData } from '../catalog-data';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 60;

/**
 * Category service page (`/services/hair`, `/services/haircut`, …).
 *
 * Mirrors the static-html mock, where a category deep-link opens the same
 * interactive `PricesPage` catalog with the matching tab pre-selected — so this
 * route renders the very same hero / stats / catalog / promo layout as
 * `/services`, only with the requested category (and subcategory) preselected.
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
  const [dict, { page, isError }, { categories, salons, services }] =
    await Promise.all([
      getDictionary(),
      getPageByUrl(handle),
      getServicesCatalogData(),
    ]);
  ServerProvider('dict', dict);

  if (!page || isError) {
    return notFound();
  }

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

  const title = page.localizeInfos?.title ?? 'Services & Prices';
  /** Stats line under the hero title — only when the CMS has services */
  const subtitle =
    services.length > 0
      ? `${services.length} services · ${salons.length || 3} locations across Dubai`
      : undefined;

  /** Generate structured data for service */
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.localizeInfos?.title,
    description: page.localizeInfos?.plainValue || page.localizeInfos?.title,
    provider: {
      '@type': 'Organization',
      name: 'OneEntry Beauty',
    },
    url: `${getSiteUrl()}/services/${handle}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <ServicesHero title={title} subtitle={subtitle} />
      {services.length > 0 && (
        <StatsStrip
          stats={[
            [services.length, 'Services'],
            [salons.length, 'Locations'],
            [categories.length, 'Categories'],
          ]}
        />
      )}
      <ServicesCatalog
        key={handle}
        categories={categories}
        salons={salons}
        services={services}
        {...(initialCategory ? { initialCategory } : {})}
        {...(initialSubcategory ? { initialSubcategory } : {})}
      />
      <PromoBanner />
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
