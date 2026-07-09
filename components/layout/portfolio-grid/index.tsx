import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import { getAdminsInfo, getPageById, getPagesByIds } from '@/app/api';
import getLqipPreview from '@/components/hooks/getLqipPreview';

import PortfolioGrid from './components/PortfolioGrid';

/**
 * PortfolioGrid section
 * @param   {object}               props            - Props for the component
 * @param   {string}               props.handle     - Handle of the portfolio
 * @param   {object}               props.searchData - Resolved page searchParams (expects `service` id)
 * @returns {Promise<JSX.Element>}                  React component
 */
const PortfolioGridLayout = async ({
  handle,
  searchData,
}: {
  handle: string;
  searchData?: Record<string, string | string[] | undefined> | undefined;
}): Promise<JSX.Element> => {
  /** Fetch admin information including masters data */
  const { admins } = await getAdminsInfo({ body: [], offset: 0, limit: 100 });
  /** Find the specific master by handle (ID) */
  const master = admins?.find(
    (admin: IAdminEntity) => admin.id === Number(handle),
  );

  /** if no data in searchParams get first master service id */
  const servicesArr = master?.attributeValues?.services?.value as
    Array<{ id: number }> | undefined;
  const sId = Number(searchData?.service) || servicesArr?.[0]?.id;

  /** Fetch service page data by service ID */
  const { page: service, isError } = await getPageById(sId as number);

  /** Return empty fragment if master not found or error occurred */
  if (!master || isError) {
    return <></>;
  }

  /** Extract master portfolio attribute values */
  const { master_portfolio } = master.attributeValues;
  /** Get master portfolio items or empty array as fallback */
  const masterPortfolio =
    (master_portfolio?.value as
      Array<{ id: number; parentId: number }> | undefined) || [];
  /** Extract IDs from portfolio items */
  const ids = masterPortfolio.map((v) => v.id);
  /** Extract parent IDs from portfolio items */
  const parentIds = masterPortfolio.map((v) => v.parentId);

  /** Fetch child pages by portfolio item IDs */
  const { pages: childPages } = await getPagesByIds(ids);
  /** Fetch parent pages by portfolio item parent IDs */
  const { pages: parentPages } = await getPagesByIds(parentIds);

  /** Process portfolio images with low quality previews */
  const portfolioImages = await Promise.all(
    /** Process all child pages to extract portfolio images */
    childPages?.flatMap((page) => {
      /** Check if current page belongs to the selected service category */
      const isInService = parentPages?.find((parent) => {
        const catArr = parent.attributeValues.gallery_category?.value as
          Array<{ id: number }> | undefined;
        return Number(service?.id || 0) === Number(catArr?.[0]?.id || 0);
      });
      /** If page belongs to the current service or no service is selected, process its images */
      if (isInService?.id === page.parentId || service === undefined) {
        const photos = page.attributeValues.gallery_photos?.value as
          Array<{ previewLink: string; downloadLink: string }> | undefined;
        /** Map through all gallery photos on this page */
        return (photos ?? []).map(async (imgSrc) => {
          return {
            img: imgSrc.downloadLink,
            thumb: imgSrc.previewLink || imgSrc.downloadLink,
            preview:
              (await getLqipPreview(
                imgSrc.previewLink || imgSrc.downloadLink,
              )) ?? '',
            /** TODO: Add proper alt text for accessibility */
            alt: '...',
          };
        });
      }
      /** Return empty array if page doesn't match current service filter */
      return [];
    }) || [],
  );

  /** Render portfolio grid with processed images */
  return (
    <div className="grid w-full grid-cols-6 gap-0 max-2xl:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
      <PortfolioGrid portfolioImages={portfolioImages} />
    </div>
  );
};

export default PortfolioGridLayout;
