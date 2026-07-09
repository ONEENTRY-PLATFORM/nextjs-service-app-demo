import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import {
  getChildPagesByParentUrl,
  getPageByUrl,
  getProductsByPageUrl,
} from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import OffersTable from '@/components/layout/offers-table';
import GradientLine from '@/components/shared/GradientLine';

/**
 * OffersPageLayout component renders the special offers page (`main` menu →
 * Offers). Collects `service_set` products from every service category and
 * shows them grouped by offer type.
 * @returns {Promise<JSX.Element>} JSX element representing the offers page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
const OffersPageLayout = async (): Promise<JSX.Element> => {
  /** All three fetches are independent — run in parallel. */
  const [dict, pageResult, categoriesResult] = await Promise.all([
    getDictionary(),
    getPageByUrl('offers'),
    getChildPagesByParentUrl('services'),
  ]);
  ServerProvider('dict', dict);

  const { page, isError } = pageResult;
  if (!page || isError) {
    return notFound();
  }

  /** Collect special offers (service_set products) from every service category */
  const categories = (categoriesResult.pages ?? []) as IPagesEntity[];
  const sections = (
    await Promise.all(
      categories.map(async (category) => {
        const { products } = await getProductsByPageUrl({
          limit: 100,
          offset: 0,
          params: { handle: category.pageUrl },
        });
        const offers = (products ?? []).filter(
          (product: IProductsEntity) =>
            product.attributeSetIdentifier === 'service_set',
        );
        return { category, offers };
      }),
    )
  ).filter((section) => section.offers.length > 0);

  return (
    <>
      <GradientLine />
      <section className="flex w-full flex-col items-center bg-white px-16 pt-12 pb-4 max-md:px-5 max-md:pb-20">
        <div className="mb-10 flex w-220 max-w-full flex-col gap-10">
          <h1 className="text-3xl font-bold text-ink uppercase">
            {page.localizeInfos?.title}
          </h1>
          {sections.map(({ category, offers }) => (
            <OffersTable key={category.id} products={offers} service={category} />
          ))}
        </div>
      </section>
    </>
  );
};

export default OffersPageLayout;

/**
 * Generate page metadata
 * @async
 * @returns {Promise<Metadata>} metadata
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata(): Promise<Metadata> {
  /** get page by Url */
  const { page, isError } = await getPageByUrl('offers');
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
