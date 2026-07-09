import type { JSX } from 'react';

import GalleryCardAnimations from '@/app/animations/GalleryCardAnimations';

import PortfolioCardImage from './PortfolioCardImage';

/**
 * PortfolioCard component displays a single portfolio item in a grid layout with animation
 * @param   {object}      props              - Component properties
 * @param   {object}      props.item         - Portfolio item data containing image URLs and alt text
 * @param   {string}      props.item.img     - Full size image URL
 * @param   {string}      props.item.thumb   - Thumbnail image URL
 * @param   {string}      props.item.preview - Preview image URL
 * @param   {string}      props.item.alt     - Alternative text for the image
 * @param   {number}      props.index        - Index of the card for animation purposes
 * @returns {JSX.Element}                    JSX element representing a portfolio card with animation
 */
const PortfolioCard = ({
  item,
  index,
}: {
  item: {
    img: string;
    thumb: string;
    preview: string;
    alt: string;
  };
  index: number;
}): JSX.Element => {
  return (
    <GalleryCardAnimations
      className="group relative flex min-h-80 cursor-pointer flex-col overflow-hidden max-xs:min-h-60 max-xs:min-w-[50vw] max-md:min-h-65"
      index={index}
    >
      <PortfolioCardImage item={item} />
    </GalleryCardAnimations>
  );
};

export default PortfolioCard;
