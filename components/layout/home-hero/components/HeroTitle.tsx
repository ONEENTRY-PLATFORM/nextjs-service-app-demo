'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

/**
 * HeroTitle section component.
 *
 * This component renders the main title for the hero section of the homepage.
 * It displays a title with a percentage symbol, using large text styling.
 * @param   {object}           props                 - Component properties
 * @param   {IAttributeValues} props.attributeValues - Object containing title attribute value
 * @returns {JSX.Element}                            JSX.Element representing the HeroTitle
 */
const HeroTitle = ({
  attributeValues,
}: {
  attributeValues: IAttributeValues;
}): JSX.Element => {
  /** Extract title from attribute values */
  const { title } = attributeValues;

  /** Render hero title with percentage symbol */
  return (
    <h1 className="hero-title mb-4 flex items-baseline justify-start text-[210px] leading-55 max-lg:text-display max-lg:leading-30 max-md:text-9xl max-md:leading-32.5 max-sm:text-9xl">
      {title?.value?.toString() || ''}{' '}
      <span className="text-8xl leading-17.5">%</span>
    </h1>
  );
};

export default HeroTitle;
