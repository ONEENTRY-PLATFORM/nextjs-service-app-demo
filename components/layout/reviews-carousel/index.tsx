import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

import ReviewsCarousel from './components/ReviewsCarousel';

/**
 * ReviewsCarousel Section
 * @returns {JSX.Element} React component
 */
const ReviewsCarouselLayout = (): JSX.Element => {
  /** Define title for the reviews section */
  const title = 'Reviews';

  return (
    <div className="flex flex-col items-center bg-white px-16 pt-4 pb-20 max-md:px-5">
      <TitleAnimations className="mx-auto mb-10 flex w-fit flex-col gap-4">
        <h2 className="title text-4xl leading-7 font-light tracking-widest text-ink uppercase">
          {title}
        </h2>
        <hr className="relative mb-2.5 h-px w-full self-center border-b border-solid border-b-gray-600" />
      </TitleAnimations>
      <ReviewsCarousel />
    </div>
  );
};

export default ReviewsCarouselLayout;
