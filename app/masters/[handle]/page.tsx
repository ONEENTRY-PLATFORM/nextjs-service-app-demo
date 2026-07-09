import type { Metadata } from 'next';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';
import { Suspense } from 'react';

import LineAnimations from '@/app/animations/LineAnimations';
import { getAdminsInfo, getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import MasterSingleLayout from '@/components/layout/master-single';
import MasterLoader from '@/components/layout/master-single/components/MasterLoader';
import PortfolioGridLayout from '@/components/layout/portfolio-grid';
import PortfolioGridLoader from '@/components/layout/portfolio-grid/components/PortfolioGridLoader';
import GradientLine from '@/components/shared/GradientLine';

// export const revalidate = 10;
// export const dynamicParams = true;

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
    getAdminsInfo({
      body: [],
      offset: 0,
      limit: 100,
    }),
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
        url: `${process.env.NEXT_PUBLIC_ONEENTRY_URL || 'https://oneentry.cloud'}/masters/${handle}`,
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      <GradientLine />
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
      <div className="flex w-full flex-col justify-center">
        <div className="mx-auto flex w-full flex-col">
          <LineAnimations className="gradient-bg-line-20" delay={0.5} />
          <Suspense fallback={<PortfolioGridLoader />}>
            <PortfolioGridLayout handle={handle} searchData={searchData} />
          </Suspense>
        </div>
      </div>
    </>
    // <Loader />
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

  const { admins, isError } = await getAdminsInfo({
    body: [],
    offset: 0,
    limit: 100,
  });

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
    getAdminsInfo({
      body: [],
      offset: 0,
      limit: 100,
    }),
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
  const description = localizeInfos?.plainValue || localizeInfos?.title;

  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      title,
      description,
    },
  };
}
