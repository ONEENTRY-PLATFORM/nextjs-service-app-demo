import Image from 'next/image';
import type { JSX } from 'react';

import getLqipPreview from '@/components/hooks/getLqipPreview';

/**
 * MasterImage component to render an image with specified source and alt text.
 * @param   {object}               props          - Props for the MasterImage component.
 * @param   {string}               props.imageSrc - Source URL of the image.
 * @param   {string}               props.alt      - Alternative text for the image.
 * @returns {Promise<JSX.Element>}                Promise resolving to a JSX element with the master image, or an empty fragment if no source is provided.
 */
const MasterImage = async ({
  imageSrc,
  alt,
}: {
  imageSrc: string;
  alt: string;
}): Promise<JSX.Element> => {
  /** Check if image source is provided, return empty fragment if not */
  if (!imageSrc) {
    return <></>;
  }

  /** Render master image with specified dimensions and properties */
  return (
    <Image
      width={398}
      height={464}
      src={imageSrc}
      alt={alt}
      priority
      placeholder="blur"
      /** Generate low quality image placeholder for blur effect */
      blurDataURL={(await getLqipPreview(imageSrc)) || ''}
      className="aspect-photo size-full object-cover"
    />
  );
};

export default MasterImage;
