import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import {
  getChildPagesByParentUrl,
  getPageByUrl,
  getProductsByPageUrl,
} from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import OffersTable from '@/components/layout/offers-table';
import ProductsTable from '@/components/layout/products-table';
import ServiceHero from '@/components/layout/service-hero';

/**
 * Service page layout.
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

  /** Dict, page, and products are all independent — fetch in parallel. */
  const [dict, { page, isError }, { products }] = await Promise.all([
    getDictionary(),
    getPageByUrl(handle),
    getProductsByPageUrl({
      limit: 100,
      offset: 0,
      params: { handle },
    }),
  ]);
  ServerProvider('dict', dict);

  if (!page || isError || !products) {
    return notFound();
  }

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
    url: `${process.env.NEXT_PUBLIC_ONEENTRY_URL || 'https://oneentry.cloud'}/services/${handle}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <ServiceHero page={page} />
      <div className="flex w-full flex-col items-center bg-white px-16 pt-12 pb-20 max-md:px-5 max-md:pb-4">
        <div className="mb-10 flex w-220 max-w-full flex-col gap-10">
          <ProductsTable
            title={page.localizeInfos.title}
            products={products}
            service={page}
          />
          <OffersTable products={products} service={page} />
        </div>
      </div>
    </>
  );
}

/**
 * Pre-generation of page
 * @returns {Promise<Array<{ handle: string }>>} Array of static paths with handle parameters
 */
export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const { pages, isError } = await getChildPagesByParentUrl('services');
  const params: Array<{ handle: string }> = [];

  if (!isError && pages) {
    pages.forEach((page) => {
      params.push({ handle: page.pageUrl });
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
