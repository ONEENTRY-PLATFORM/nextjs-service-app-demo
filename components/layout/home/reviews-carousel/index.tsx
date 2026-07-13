import type { JSX } from 'react';

import SectionTitle from '@/components/shared/SectionTitle';

import ReviewsCarousel from './components/ReviewsCarousel';

/**
 * ReviewsCarousel Section
 * @returns {JSX.Element} React component
 */
const ReviewsCarouselLayout = (): JSX.Element => {
  /** Define title for the reviews section */
  const title = 'Reviews';

  return (
    <div
      id="reviews"
      className="flex scroll-mt-24 flex-col items-center bg-white px-3 pt-4 pb-8 xl:py-10 md:px-8 md:py-6"
    >
      <SectionTitle title={title} className="mb-6 md:mb-10" />
      <ReviewsCarousel />
    </div>
  );
};

export default ReviewsCarouselLayout;
