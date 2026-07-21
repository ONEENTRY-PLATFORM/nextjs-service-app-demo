import type { Metadata } from 'next';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import { pageOpenGraph } from '@/app/utils/pageOpenGraph';
import { serializeJsonLd } from '@/app/utils/serializeJsonLd';
import MasterSingleLayout from '@/components/layout/master-single';
import MasterLoader from '@/components/layout/master-single/components/MasterLoader';
import PortfolioGridLayout from '@/components/layout/portfolio-grid';
import PortfolioGridLoader from '@/components/layout/portfolio-grid/components/PortfolioGridLoader';

/**
 * ISR: refresh the prerendered CMS content on a timer. Not `force-static` —
 * this route reads request-time data (searchParams) or has no static params.
 */
export const revalidate = 60;

/**
 * MasterPage Layout component that displays a single master's details.
 * @param   {object}                      props              - Component properties.
 * @param   {Promise<{ handle: string }>} props.params       - Route parameters including handle.
 * @param   {Promise<object>}             props.searchParams - URL search parameters.
 * @returns {Promise<JSX.Element>}                           MasterPage JSX element.
 */
export default async function MasterPageLayout({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<JSX.Element> {
  /** Params, searchParams, dict and admin-info reads are independent. */
  const [{ handle }, searchData, dict, { admins }] = await Promise.all([
    params,
    searchParams ?? Promise.resolve(undefined),
    getDictionary(),
    getMastersList(),
  ]);
  ServerProvider('dict', dict);

  /** Get admin info for structured data */
  const adminId = parseInt(handle, 10);
  const admin = admins?.find((a: IAdminEntity) => a.id === adminId);

  /** Generate structured data for master profile */
  const masterName = admin?.attributeValues?.master_name?.value;
  const structuredData = admin
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: masterName,
        url: `${getSiteUrl()}/masters/${handle}`,
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(structuredData),
          }}
        />
      )}
      <Suspense fallback={<MasterLoader />}>
        <MasterSingleLayout
          handle={handle}
          searchData={
            searchData
              ? { service: searchData.service as string }
              : { service: '' }
          }
        />
      </Suspense>
      <Suspense fallback={<PortfolioGridLoader />}>
        <PortfolioGridLayout handle={handle} searchData={searchData} />
      </Suspense>
    </>
  );
}

/**
 * Pre-generate static paths for master pages
 * @returns {Promise<Array<{ handle: string }>>} Array of static paths with handle parameters
 */
export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const params: Array<{ handle: string }> = [];

  const { admins, isError } = await getMastersList();

  if (!isError && admins) {
    admins.forEach((admin: IAdminEntity) => {
      params.push({ handle: admin.id.toString() });
    });
  }

  return params;
}

/**
 * Generate page metadata
 * @param   {object}                      props        - props
 * @param   {Promise<{ handle: string }>} props.params - page params
 * @returns {Promise<Metadata>}                        metadata
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  /** Handle, page and admin reads are independent — run in parallel. */
  const [{ handle }, { page, isError }, { admins }] = await Promise.all([
    params,
    getPageByUrl('masters'),
    getMastersList(),
  ]);

  if (isError || !page) {
    return {};
  }

  /** Get admin info for person data */
  const adminId = parseInt(handle, 10);

  const admin = admins?.find((a: IAdminEntity) => a.id === adminId);

  /** extract data from page */
  const { localizeInfos } = page;
  const masterName = admin?.attributeValues?.master_name?.value;

  const title = masterName
    ? `${masterName} - ${localizeInfos?.title}`
    : localizeInfos?.title;
  const description = getPagePlainContent(page) || localizeInfos?.title;

  return {
    title,
    description,
    alternates: { canonical: `/masters/${handle}` },
    openGraph: {
      ...(await pageOpenGraph(`/masters/${handle}`)),
      type: 'profile',
      title,
      description,
    },
  };
}
