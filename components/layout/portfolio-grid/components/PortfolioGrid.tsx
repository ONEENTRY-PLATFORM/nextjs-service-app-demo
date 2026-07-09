/* eslint-disable jsdoc/check-param-names */
'use client';

import 'photoswipe/dist/photoswipe.css';

import type { JSX } from 'react';
import { Gallery } from 'react-photoswipe-gallery';

import PortfolioCard from './PortfolioCard';

/**
 * PortfolioGrid component is used to display a portfolio image grid
 * This component receives an array of images and uses the Gallery wrapper to render cards for each image
 * @param   {object}        props                           - Component property object
 * @param   {Array<object>} props.portfolioImages           - Array containing portfolio image information
 * @param   {string}        props.portfolioImages[].img     - Full size URL of the image
 * @param   {string}        props.portfolioImages[].thumb   - Thumbnail URL of the image
 * @param   {string}        props.portfolioImages[].preview - Preview image URL
 * @param   {string}        props.portfolioImages[].alt     - Alternative text description of the image
 * @returns {JSX.Element}                                   Returns a Gallery component containing all portfolio images
 */
const PortfolioGrid = ({
  portfolioImages,
}: {
  portfolioImages: {
    img: string;
    thumb: string;
    preview: string;
    alt: string;
  }[];
}): JSX.Element => (
  <Gallery>
    {portfolioImages.map((item, index) => (
      <PortfolioCard key={index} item={item} index={index} />
    ))}
  </Gallery>
);

export default PortfolioGrid;
