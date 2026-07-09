'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { CSSProperties, HTMLAttributes, JSX } from 'react';
import { useState } from 'react';
import Carousel from 'react-simply-carousel';

import NavigationButton from '@/components/shared/NavigationButton';

import MastersFeedCard from './MastersFeedCard';

/**
 * MastersFeedCarousel component displays masters in a responsive carousel
 * @param   {object}           props         - Component properties
 * @param   {IAdminEntity[]}   props.masters - Array of master entities to display in the carousel
 * @param   {IAttributeValues} props.dict    - Dictionary containing localized texts
 * @returns {JSX.Element}                    React component with carousel functionality for displaying masters
 */
const MastersFeedCarousel = ({
  masters,
  dict,
}: {
  masters: IAdminEntity[];
  dict: IAttributeValues;
}): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  /** State to control autoplay functionality */
  const [state, setState] = useState<boolean>(false);

  /** Container properties for the carousel */
  const containerProps: HTMLAttributes<HTMLDivElement> = {
    style: {
      userSelect: 'none',
      flexFlow: 'nowrap',
    },
    className: 'w-full min-w-full no-wrap',
  };

  /** Common style properties for navigation arrows */
  const arrowStyle: CSSProperties = {
    minWidth: 30,
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    zIndex: 165,
  };

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
        style: { ...arrowStyle, right: 20 },
        className: 'group',
      }}
      backwardBtnProps={{
        children: <NavigationButton direction="left" />,
        style: { ...arrowStyle, left: 20 },
        className: 'group',
      }}
      activeSlideIndex={currentIndex}
      onRequestChange={setCurrentIndex}
      itemsToShow={6}
      centerMode={true}
      speed={500}
      autoplay={state}
      autoplayDelay={2500}
      easing="ease-in-out"
      // preventScrollOnSwipe={true}
      /** Responsive configuration for different screen sizes */
      responsiveProps={[
        { minWidth: 1360, itemsToShow: 6 },
        { minWidth: 1200, maxWidth: 1359, itemsToShow: 5 },
        { minWidth: 992, maxWidth: 1199, itemsToShow: 4 },
        { minWidth: 768, maxWidth: 992, itemsToShow: 3 },
        { maxWidth: 767, itemsToShow: 3 },
      ]}
    >
      {masters.map((master, index) => (
        <MastersFeedCard
          key={index}
          dict={dict}
          master={master}
          setState={setState}
          index={index}
        />
      ))}
    </Carousel>
  );
};

export default MastersFeedCarousel;
