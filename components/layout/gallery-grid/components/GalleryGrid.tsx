'use client';

import 'photoswipe/dist/photoswipe.css';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';
import { Gallery } from 'react-photoswipe-gallery';

import GalleryCard from './GalleryCard';

/**
 * Gallery grid type
 */
type ICardData = {
  name: string;
  link: string;
  img: string;
  thumb: string;
  preview: string | null;
  spec?:
    | {
        id?: number | undefined;
        title?: string | undefined;
      }
    | undefined;
};

/**
 * GalleryGrid component to render a grid of gallery cards with lightbox functionality.
 *
 * This component renders a responsive grid of gallery cards using the PhotoSwipe library
 * for an enhanced image viewing experience. Each card represents
 * a master's work with their name, specialization, and a link to their profile.
 * @param   {object}           props           - Component properties
 * @param   {IAttributeValues} props.dict      - Dictionary object containing localized text values for UI elements
 * @param   {ICardData[]}      props.cardsData - Array of card data objects to display in the gallery grid
 * @returns {JSX.Element}                      JSX.Element representing the gallery grid wrapped in a PhotoSwipe Gallery context
 */
const GalleryGrid = ({
  dict,
  cardsData,
}: {
  dict: IAttributeValues;
  cardsData: ICardData[];
}): JSX.Element => {
  return (
    <Gallery>
      {cardsData?.map((cardData, index) => (
        <GalleryCard
          key={index}
          index={index}
          dict={dict}
          cardData={cardData}
        />
      ))}
    </Gallery>
  );
};

export default GalleryGrid;
