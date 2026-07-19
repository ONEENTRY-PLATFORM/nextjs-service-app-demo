import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import { getPagesByIds } from '@/app/api';
import { getMastersList } from '@/app/api/utils/getMastersList';
import SectionHeading from '@/components/shared/SectionHeading';

import PortfolioGallery from './components/PortfolioGallery';

/**
 * PortfolioGrid section — the specialist's portfolio heading, grid and lightbox.
 *
 * The data logic is unchanged: it resolves the master's `master_portfolio`
 * photo pages and flattens their `gallery_photos` into `{ img, thumb, preview,
 * alt }`. Presentation follows the reference design — a centered "Portfolio"
 * heading above a responsive grid backed by a custom lightbox. Renders nothing
 * when the master or their portfolio is unavailable.
 * @param   {object}               props            - Props for the component.
 * @param   {string}               props.handle     - Handle of the portfolio (master id).
 * @param   {object}               props.searchData - Route search params (unused; kept for the call site).
 * @returns {Promise<JSX.Element>}                  React component.
 */
const PortfolioGridLayout = async ({
  handle,
}: {
  handle: string;
  searchData?: Record<string, string | string[] | undefined> | undefined;
}): Promise<JSX.Element> => {
  /** Fetch admin information including masters data */
  const { admins } = await getMastersList();
  /** Find the specific master by handle (ID) */
  const master = admins?.find(
    (admin: IAdminEntity) => admin.id === Number(handle),
  );

  /** Return empty fragment if the master is not found */
  if (!master) {
    return <></>;
  }

  /** Guard the attribute bag: `attributeValues` can be absent on a bare entity. */
  const masterAttrs = master.attributeValues || {};

  /** Caption data for the lightbox and the portfolio images' alt text. */
  const masterName =
    (masterAttrs.master_name?.value as string | undefined) ?? '';
  const role =
    (masterAttrs.master_short_description?.value as string | undefined) ?? '';

  /**
   * `master_portfolio` is an `entity` list of the master's gallery photo pages:
   * `[{ value: { id: <photoPageId>, parentId: <category page id> } }]`.
   * We render every image from those pages — the profile shows the master's
   * whole portfolio (service-context filtering was removed: `master_services`
   * now links products/subcategories that don't line up with the photo pages'
   * `gallery_category`, so filtering here would hide everything).
   */
  const masterPortfolio =
    (masterAttrs.master_portfolio?.value as
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
   * — an object keyed by preset: `{ [preset]: [base64-LQIP, lqipURL] }`.
   * Both preview variants are tiny LQIP blurs (`[1]` is a ~20×20 URL, not a
   * display thumbnail), so the grid renders the full `downloadLink` and only
   * uses `[0]` as the inline blur placeholder — mirroring the gallery page.
   */
  const portfolioImages =
    childPages?.flatMap((page) => {
      const photos = page.attributeValues?.gallery_photos?.value as
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
          thumb: imgSrc.downloadLink,
          preview: pv?.[0] || '',
          /** CMS portfolio photos carry no caption — name the specialist. */
          alt: masterName
            ? `Portfolio work by ${masterName}`
            : 'Specialist portfolio work',
        };
      });
    }) || [];

  /** Degrade cleanly: no photos → no portfolio section. */
  if (portfolioImages.length === 0) {
    return <></>;
  }

  /** Render portfolio heading + gallery with lightbox */
  return (
    <section className="bg-white pb-4" data-testid="portfolio">
      <div className="mx-auto max-w-7xl px-3 py-3 md:px-8 md:py-6">
        <SectionHeading>Portfolio</SectionHeading>
      </div>
      <PortfolioGallery
        images={portfolioImages}
        masterName={masterName}
        role={role}
      />
    </section>
  );
};

export default PortfolioGridLayout;
