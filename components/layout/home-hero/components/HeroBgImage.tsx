'use client';

import Image from 'next/image';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

/**
 * HeroBgImage component.
 *
 * This component renders the background image for the hero section.
 * It displays a full-screen image with gradient overlay.
 * @param   {object}           props                 - Component properties
 * @param   {IAttributeValues} props.attributeValues - Object containing image and title attributes
 * @returns {JSX.Element}                            JSX.Element representing the HeroBgImage
 */
const HeroBgImage = ({
  attributeValues,
}: {
  attributeValues: IAttributeValues;
}): JSX.Element => {
  /** Extract title and background image from attribute values */
  const { title, bg_image } = attributeValues;
  const bgArr = bg_image?.value as Array<{ downloadLink?: string }> | undefined;
  /** Get hero background image URL or fallback to empty string */
  const heroImage = bgArr?.[0]?.downloadLink ?? '';

  /** Render hero background image with gradient overlay */
  return (
    <div className="bg-wrapper absolute inset-0 size-full bg-gradient-1">
      {heroImage && (
        <Image
          fill
          alt={(title?.value as string | undefined) || '...'}
          src={heroImage}
          sizes="(min-width: 1600px) 50vw, 100vw"
          // placeholder="blur"
          // blurDataURL={preview}
          fetchPriority="high"
          priority
          className="hero-bg inset-0 mx-auto size-full max-w-500 object-cover"
        />
      )}
    </div>
  );
};

export default HeroBgImage;
