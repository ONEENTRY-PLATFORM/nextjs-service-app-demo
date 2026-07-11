'use client';

import type { CSSProperties, HTMLAttributes, JSX, Key } from 'react';
import { useState } from 'react';
import Carousel from 'react-simply-carousel';

import NavigationButton from '@/components/shared/NavigationButton';

import CarouselCard from './CarouselCard';

/** Card data prepared server-side by the GalleryFeed section */
export type GalleryFeedCard = {
  name: string;
  link: string;
  img: string;
  thumb: string;
  preview: string | null;
  spec: {
    title: string;
  };
};

/**
 * GalleryFeedCarousel section
 * @param   {object}            props       - component props
 * @param   {GalleryFeedCard[]} props.cards - cards data
 * @param   {IAttributeValues}  props.dict  - dictionary
 * @returns {JSX.Element}                   React component
 */
const GalleryFeedCarousel = ({
  cards,
}: {
  cards: GalleryFeedCard[];
}): JSX.Element => {
  /** Track the current active slide index in the carousel */
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  /** Kept for the card animation hover callback; autoplay stays disabled */
  const [, setState] = useState<boolean>(false);

  /** Define container properties for the carousel */
  const containerProps = {
    style: {
      userSelect: 'none',
      flexFlow: 'nowrap',
    },
    className: 'w-full min-w-full no-wrap relative',
  } as HTMLAttributes<HTMLDivElement>;

  /** Define common arrow button styles for navigation */
  const arrowStyle = {
    minWidth: 30,
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    zIndex: 45,
  } as CSSProperties;

  /** Render responsive gallery carousel with navigation controls */
  return (
    <Carousel
      infinite
      showSlidesBeforeInit={false}
      containerProps={containerProps}
      activeSlideProps={{
        style: {},
      }}
      forwardBtnProps={{
        children: <NavigationButton direction="right" />,
        style: {
          ...arrowStyle,
          right: 20,
        },
        className: 'group arrow',
      }}
      backwardBtnProps={{
        children: <NavigationButton direction="left" />,
        style: {
          ...arrowStyle,
          left: 20,
        },
        className: 'group arrow',
      }}
      activeSlideIndex={currentIndex}
      onRequestChange={setCurrentIndex}
      itemsToShow={6}
      centerMode={true}
      speed={500}
      autoplay={false}
      autoplayDelay={2500}
      easing="ease-in-out"
      // preventScrollOnSwipe={true}
      responsiveProps={[
        { minWidth: 1360, itemsToShow: 6 },
        { minWidth: 1200, maxWidth: 1359, itemsToShow: 5 },
        { minWidth: 992, maxWidth: 1199, itemsToShow: 4 },
        { minWidth: 768, maxWidth: 992, itemsToShow: 3 },
        { maxWidth: 767, itemsToShow: 3 },
      ]}
      /** persistentChangeCallbacks */
    >
      {/** Map through cards data to render carousel items */}
      {cards?.map((cardData, index: Key) => {
        return (
          <CarouselCard
            key={index}
            cardData={cardData}
            setState={setState}
            index={index as number}
          />
        );
      })}
    </Carousel>
  );
};

export default GalleryFeedCarousel;
