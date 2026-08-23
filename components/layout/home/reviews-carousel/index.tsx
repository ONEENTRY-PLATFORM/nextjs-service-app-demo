import type { IAttributeValues } from 'oneentry/types';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import SectionTitle from '@/components/shared/SectionTitle';
import { dictText } from '@/components/utils/dictText';

import ReviewsCarousel from './components/ReviewsCarousel';

/**
 * ReviewsCarousel Section
 * @returns {JSX.Element} React component
 */
const ReviewsCarouselLayout = (): JSX.Element => {
  /** UI-text dictionary (system_content) with English fallbacks */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Define title for the reviews section */
  const title = dictText(dict, 'home_reviews_title', 'Reviews');

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
