import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import { getAdminsInfo, getPagesByIds } from '@/app/api';

import PortfolioGrid from './components/PortfolioGrid';

/**
 * PortfolioGrid section
 * @param   {object}               props        - Props for the component
 * @param   {string}               props.handle - Handle of the portfolio (master id)
 * @returns {Promise<JSX.Element>}              React component
 */
const PortfolioGridLayout = async ({
  handle,
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

  /** Return empty fragment if the master is not found */
  if (!master) {
    return <></>;
  }

  /**
   * `master_portfolio` is an `entity` list of the master's gallery photo pages:
   * `[{ value: { id: <photoPageId>, parentId: <category page id> } }]`.
   * We render every image from those pages — the profile shows the master's
   * whole portfolio (service-context filtering was removed: `master_services`
   * now links products/subcategories that don't line up with the photo pages'
   * `gallery_category`, so filtering here would hide everything).
   */
  const masterPortfolio =
    (master.attributeValues.master_portfolio?.value as
      Array<{ value?: { id?: number } }> | undefined) || [];
  /** Extract photo-page IDs from portfolio items */
  const ids = masterPortfolio
    .map((v) => v.value?.id)
    .filter((id): id is number => typeof id === 'number');

  /** Fetch the master's photo pages */
  const { pages: childPages } = await getPagesByIds(ids);

  /**
   * Flatten every gallery photo across the master's photo pages.
   * `groupOfImages` items carry `downloadLink` (full URL) and `previewLink`
   * — an object keyed by preset: `{ [preset]: [base64-LQIP, previewURL] }`.
   * The base64 LQIP is inline, so no extra fetch is needed for the blur.
   */
  const portfolioImages =
    childPages?.flatMap((page) => {
      const photos = page.attributeValues.gallery_photos?.value as
        | Array<{
            downloadLink: string;
            defaultPreview?: string;
            previewLink?: Record<string, string[]>;
          }>
        | undefined;
      return (photos ?? []).map((imgSrc) => {
        const preset = imgSrc.defaultPreview || 'default';
        const pv = imgSrc.previewLink?.[preset];
        return {
          img: imgSrc.downloadLink,
          thumb: pv?.[1] || imgSrc.downloadLink,
          preview: pv?.[0] || '',
          /** TODO: Add proper alt text for accessibility */
          alt: '...',
        };
      });
    }) || [];

  /** Render portfolio grid with processed images */
  return (
    <div className="grid w-full grid-cols-6 gap-0 max-2xl:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
      <PortfolioGrid portfolioImages={portfolioImages} />
    </div>
  );
};

export default PortfolioGridLayout;
