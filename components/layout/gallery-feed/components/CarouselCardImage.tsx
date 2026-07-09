// import Image from 'next/image';
import type { JSX } from 'react';

import Image from '@/components/shared/Image';

/**
 * Carousel card image component
 *
 * This component renders an image in a carousel card with lazy loading and blur preview features
 * @param   {object}      props                  - Component properties
 * @param   {object}      props.cardData         - Card data object
 * @param   {string}      props.cardData.name    - Image name, used as alt attribute
 * @param   {string}      props.cardData.thumb   - Thumbnail URL
 * @param   {string}      props.cardData.preview - Preview image URL, used for blur placeholder
 * @returns {JSX.Element}                        Image element or empty element
 */
const CarouselCardImage = ({
  cardData: { name, thumb, preview },
}: {
  cardData: {
    name: string;
    thumb: string;
    preview: string | null;
  };
}): JSX.Element => {
  /** Return empty element if no thumbnail is provided */
  if (!thumb) {
    return <></>;
  }

  /** Render image with lazy loading and blur preview effect */
  return (
    <Image
      src={thumb}
      alt={name}
      loading="lazy"
      placeholder={preview ? 'blur' : 'empty'}
      blurDataURL={preview || ''}
      className="gallery-card-img relative h-80 w-full object-cover duration-500 group-hover:scale-125 group-hover:transition-transform"
      ref={null}
    />
  );
};

export default CarouselCardImage;
