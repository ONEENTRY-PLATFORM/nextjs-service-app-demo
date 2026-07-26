import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { getDictionary } from '@/app/api/utils/dictionaries';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import MasterSingleLayout from '@/components/layout/master-single';
import MasterLoader from '@/components/layout/master-single/components/MasterLoader';
import PortfolioGridLayout from '@/components/layout/portfolio-grid';
import PortfolioGridLoader from '@/components/layout/portfolio-grid/components/PortfolioGridLoader';
import JsonLd from '@/components/shared/JsonLd';

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
  const [{ handle }, searchData, dict, mastersResult] = await Promise.all([
    params,
    searchParams ?? Promise.resolve(undefined),
    getDictionary(),
    getMastersList(),
  ]);
  ServerProvider('dict', dict);
  const { admins, isError } = mastersResult;

  /**
   * A failed roster read says nothing about whether this master exists, so it
   * must not take the `notFound()` branch below — that used to bake a 404 into
   * the ISR cache for the whole revalidate window. Throwing reaches the error
   * boundary (retry) on a cache miss, and a failed background regeneration
   * keeps serving the last valid version.
   */
  if (isError || !admins) {
    throw new Error(
      `/masters/${handle}: masters list is unavailable — rendering the error boundary instead of baking a 404 into ISR`,
    );
  }

  /**
   * Resolve the master here rather than inside the section components: the
   * route owns the 404 decision, like every other dynamic route. Deciding it
   * further down — behind a Suspense boundary — let the shell stream first, so
   * an id outside `generateStaticParams` flashed the loader before 404ing.
   */
  const adminId = parseInt(handle, 10);
  const admin = admins.find((a: IAdminEntity) => a.id === adminId);

  if (!admin) {
    notFound();
  }

  /** Generate structured data for master profile */
  const masterName = admin.attributeValues?.master_name?.value;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: masterName,
    url: `${getSiteUrl()}/masters/${handle}`,
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Suspense fallback={<MasterLoader />}>
        <MasterSingleLayout
          master={admin}
          searchData={
            searchData
              ? { service: searchData.service as string }
              : { service: '' }
          }
        />
      </Suspense>
      <Suspense fallback={<PortfolioGridLoader />}>
        <PortfolioGridLayout master={admin} />
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
  /** Handle and admin reads are independent — run in parallel. */
  const [{ handle }, { admins }] = await Promise.all([
    params,
    getMastersList(),
  ]);

  /** Get admin info for person data */
  const adminId = parseInt(handle, 10);
  const admin = admins?.find((a: IAdminEntity) => a.id === adminId);
  const masterName = admin?.attributeValues?.master_name?.value;

  return cmsPageMetadata({
    pageUrl: 'masters',
    path: `/masters/${handle}`,
    ...(typeof masterName === 'string' && masterName
      ? { titlePrefix: masterName }
      : {}),
    ogType: 'profile',
  });
}
