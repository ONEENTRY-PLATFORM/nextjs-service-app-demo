'use client';

import parse from 'html-react-parser';
import type { JSX } from 'react';

interface AttributeValues {
  text?: {
    value?: {
      htmlValue?: string;
    }[];
  };
}

/**
 * HeroDescription component.
 *
 * This component renders the description text for the hero section.
 * It parses HTML content and displays it with custom styling.
 * @param   {object}          props                 - Component properties
 * @param   {AttributeValues} props.attributeValues - Object containing text attribute with HTML content
 * @returns {JSX.Element}                           JSX.Element representing the HeroDescription or null if no description
 */
const HeroDescription = ({
  attributeValues,
}: {
  attributeValues: AttributeValues;
}): JSX.Element => {
  /** Extract text attribute from attribute values */
  const { text } = attributeValues;

  /** Get HTML description value or fallback to empty string */
  const description: string = text?.value?.[0]?.htmlValue ?? '';

  /** Render hero description with parsed HTML if available */
  return description ? (
    <div className="hero-description overflow-hidden text-7xl leading-21 tracking-wider max-lg:text-5xl max-md:mx-auto max-md:mt-10 max-md:text-4xl max-md:leading-10">
      {parse(description)}
    </div>
  ) : (
    <></>
  );
};

export default HeroDescription;
