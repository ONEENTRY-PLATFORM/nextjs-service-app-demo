import type { IAttributeValues } from 'oneentry/types';
import type { JSX } from 'react';

import { getReviews } from '@/app/api/server/reviews/getReviews';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import SectionTitle from '@/components/shared/SectionTitle';
import { dictText } from '@/components/utils/dictText';

import ReviewsCarousel from './components/ReviewsCarousel';

/** How many of the newest reviews the home slider rotates through. */
const HOME_REVIEWS_LIMIT = 4;

/**
 * ReviewsCarousel Section
 *
 * Rotates the newest CMS reviews; renders nothing at all when the storage is
 * empty, so the home page never shows an empty section.
 * @returns {Promise<JSX.Element>} React component
 */
const ReviewsCarouselLayout = async (): Promise<JSX.Element> => {
  /** UI-text dictionary (system_content) with English fallbacks */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Define title for the reviews section */
  const title = dictText(dict, 'home_reviews_title', 'Reviews');

  const { reviews = [] } = await getReviews();
  const slides = reviews.slice(0, HOME_REVIEWS_LIMIT).map((review) => ({
    id: review.id,
    title: review.author,
    text: review.text,
    rating: review.rating,
  }));

  if (slides.length === 0) {
    return <></>;
  }

  return (
    <div
      id="reviews"
      className="flex scroll-mt-24 flex-col items-center bg-white px-3 pt-4 pb-8 xl:py-10 md:px-8 md:py-6"
    >
      <SectionTitle title={title} className="mb-6 md:mb-10" />
      <ReviewsCarousel reviews={slides} />
    </div>
  );
};

export default ReviewsCarouselLayout;
