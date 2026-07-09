'use client';

import type { CSSProperties, HTMLAttributes, JSX } from 'react';
import { useState } from 'react';
import Carousel from 'react-simply-carousel';

import { reviewsData } from '@/components/data';
import NavigationButton from '@/components/shared/NavigationButton';

import ReviewsAnimations from '../animations/ReviewsAnimations';
import ReviewSlide from './ReviewSlide';

/**
 * ReviewsCarousel
 *
 * A carousel component for displaying customer reviews with automatic sliding
 * and manual navigation controls. It uses react-simply-carousel under the hood
 * and wraps it with custom animations and styling.
 * @returns {JSX.Element} React component that renders a carousel of customer reviews
 */
const ReviewsCarousel = (): JSX.Element => {
  /** State for tracking the current slide index */
  const [currentIndex, setCurrentIndex] = useState(0);
  /** State for controlling autoplay functionality */
  const [state, setState] = useState<boolean>(true);

  /** Container properties for the carousel wrapper */
  const containerProps: HTMLAttributes<HTMLDivElement> = {
    style: {
      userSelect: 'none',
      flexFlow: 'nowrap',
    },
    className: 'w-full min-w-full justify-between no-wrap',
  };

  /** Styling for navigation arrows */
  const arrowStyle: CSSProperties = {
    minWidth: 30,
    alignSelf: 'center',
    zIndex: 165,
  };

  return (
    <ReviewsAnimations className="slider relative flex w-full max-w-360">
      <Carousel
        infinite
        showSlidesBeforeInit={false}
        containerProps={containerProps}
        activeSlideProps={{
          style: {},
        }}
        forwardBtnProps={{
          children: <NavigationButton direction="right" />,
          style: arrowStyle,
          className: 'group arrow',
        }}
        backwardBtnProps={{
          children: <NavigationButton direction="left" />,
          style: arrowStyle,
          className: 'group arrow',
        }}
        activeSlideIndex={currentIndex}
        onRequestChange={setCurrentIndex}
        itemsToShow={1}
        speed={400}
        autoplay={state}
        autoplayDelay={2500}
        easing="ease-in-out"
        // preventScrollOnSwipe={true}
        centerMode={true}
      >
        {reviewsData.map((item, idx) => (
          <ReviewSlide setState={setState} key={idx} item={item} />
        ))}
      </Carousel>
    </ReviewsAnimations>
  );
};

export default ReviewsCarousel;
