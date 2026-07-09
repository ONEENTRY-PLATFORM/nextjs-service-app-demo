import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getBlockByMarker, getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import CatalogSection from '@/components/layout/catalog-grid';
import GradientLine from '@/components/shared/GradientLine';

/**
 * ServicesPageLayout component renders the services page
 * @returns {Promise<JSX.Element>} JSX element representing the services page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
const ServicesPageLayout = async (): Promise<JSX.Element> => {
  /** All three fetches are independent — run in parallel. */
  const [dict, { page, isError }, { block }] = await Promise.all([
    getDictionary(),
    getPageByUrl('services'),
    getBlockByMarker('home_catalog'),
  ]);
  ServerProvider('dict', dict);

  /** The catalog block only provides the section title — the page must not
      404 while the `home_catalog` block is not created in the CMS yet. */
  if (!page || isError) {
    return notFound();
  }

  return (
    <>
      <GradientLine />
      <section className="flex w-full flex-col items-center bg-white px-16 pt-12 pb-4 max-md:px-5 max-md:pb-20">
        <div className="mb-10 flex w-220 max-w-full flex-col gap-10">
          <CatalogSection block={block} />
        </div>
      </section>
    </>
  );
};

export default ServicesPageLayout;

/**
 * Generate page metadata
 * @async
 * @returns {Promise<Metadata>} metadata
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata(): Promise<Metadata> {
  /** get page by Url */
  const { page, isError } = await getPageByUrl('services');
  if (isError || !page) {
    return {};
  }

  /** extract data from page */
  const { localizeInfos } = page;

  return {
    title: localizeInfos?.title,
    description: localizeInfos?.plainValue,
    openGraph: {
      type: 'article',
    },
  };
}
