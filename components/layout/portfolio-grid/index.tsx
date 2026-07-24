import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import { getPagesByIds } from '@/app/api/server/pages/getPagesByIds';
import SectionHeading from '@/components/shared/SectionHeading';
import { entityPageIds } from '@/components/utils/entityLinks';
import { getGalleryImageUrls } from '@/components/utils/getGalleryImageUrls';
import { imageFileList } from '@/components/utils/imageFileList';

import PortfolioGallery from './components/PortfolioGallery';

/**
 * PortfolioGrid section — the specialist's portfolio heading, grid and lightbox.
 *
 * The data logic is unchanged: it resolves the master's `master_portfolio`
 * photo pages and flattens their `gallery_photos` into `{ img, thumb, preview,
 * alt }`. Presentation follows the reference design — a centered "Portfolio"
 * heading above a responsive grid backed by a custom lightbox. Renders nothing
 * when the master's portfolio is unavailable; the master itself is resolved by
 * the route, which owns the 404 for an unknown id.
 * @param   {object}               props        - Props for the component.
 * @param   {IAdminEntity}         props.master - Master (admin entity) resolved by the route.
 * @returns {Promise<JSX.Element>}              React component.
 */
const PortfolioGridLayout = async ({
  master,
}: {
  master: IAdminEntity;
}): Promise<JSX.Element> => {
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
  /** Extract photo-page IDs from portfolio items */
  const ids = entityPageIds(masterAttrs.master_portfolio?.value);

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
      const photos = imageFileList(page.attributeValues?.gallery_photos?.value);
      return photos.map((imgSrc) => {
        const { full, blur } = getGalleryImageUrls(imgSrc);
        return {
          img: full,
          thumb: full,
          preview: blur ?? '',
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

  /** The mock shows at most 10 portfolio photos (`portfolio.slice(0, 10)`). */
  const shownImages = portfolioImages.slice(0, 10);

  /** Render portfolio heading + gallery with lightbox */
  return (
    <section className="bg-white pb-4" data-testid="portfolio">
      <div className="mx-auto max-w-7xl p-3 md:px-8 md:py-6">
        <SectionHeading>Portfolio</SectionHeading>
      </div>
      <PortfolioGallery
        images={shownImages}
        masterName={masterName}
        role={role}
      />
    </section>
  );
};

export default PortfolioGridLayout;
