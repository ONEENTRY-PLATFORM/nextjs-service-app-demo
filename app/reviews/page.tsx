import type { Metadata } from 'next';
import type { JSX } from 'react';

import { getReviewsView } from '@/app/api/utils/getReviewsView';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import ReviewsPageContent from '@/components/layout/reviews-page';

/**
 * ISR: refresh the prerendered CMS content on a timer. Not `force-static` —
 * this route reads request-time data (searchParams) or has no static params.
 */
export const revalidate = 60;

/**
 * ReviewsPageLayout — the "/reviews" page.
 *
 * Reviews come from the `master_review` form storage, joined with the
 * specialists' salon and service category (`getReviewsView`). The page never
 * 404s over missing CMS content: an empty storage renders the empty state, and
 * the OneEntry `reviews` page entity only feeds the metadata.
 * @param   {object}                     props              - Page properties
 * @param   {Promise<{master?: string}>} props.searchParams - Optional `?master=` to pre-select a specialist
 * @returns {Promise<JSX.Element>}                          JSX element representing the reviews page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
const ReviewsPageLayout = async ({
  searchParams,
}: {
  searchParams: Promise<{ master?: string }>;
}): Promise<JSX.Element> => {
  const [{ master }, { reviews, salons }] = await Promise.all([
    searchParams,
    getReviewsView(),
  ]);

  return (
    <div className="flex w-full flex-col bg-white">
      {/* Gradient accent strip */}
      <div className="h-1.25 bg-gradient-stats" />
      <ReviewsPageContent
        reviews={reviews}
        salons={salons}
        initialMaster={master}
      />
    </div>
  );
};

export default ReviewsPageLayout;

/**
 * Generate page metadata for the reviews page. Degrades to an empty object
 * when the CMS `reviews` page is missing so the route never fails to render.
 * @returns {Promise<Metadata>} Metadata for the reviews page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    pageUrl: 'reviews',
    path: '/reviews',
  });
}
