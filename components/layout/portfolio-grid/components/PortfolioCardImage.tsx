import type { JSX, Ref } from 'react';
import { useEffect, useState } from 'react';
import { Item } from 'react-photoswipe-gallery';

import getImageSize from '@/components/hooks/getImageSize';
// import Image from 'next/image';
import Image from '@/components/shared/Image';
import Spinner from '@/components/shared/Spinner';

/**
 * PortfolioCardImage component displays a portfolio image with lightbox functionality
 * @param   {object}      props              - Component properties
 * @param   {object}      props.item         - Image data including full image, thumbnail, preview and alt text
 * @param   {string}      props.item.img     - Full size image URL
 * @param   {string}      props.item.thumb   - Thumbnail image URL
 * @param   {string}      props.item.preview - Preview image URL
 * @param   {string}      props.item.alt     - Alternative text for the image
 * @returns {JSX.Element}                    JSX element representing a portfolio image with lightbox capabilities
 */
const PortfolioCardImage = ({
  item: { img, thumb, preview, alt },
}: {
  item: {
    img: string;
    thumb: string;
    preview: string;
    alt: string;
  };
}): JSX.Element => {
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  /** Fetch image size when component mounts or when image URL changes */
  useEffect(() => {
    /**
     * Fetch the dimensions of the full-size image
     * @param {string} imgUrl - URL of the full-size image
     */
    const fetchImageSize = async (imgUrl: string) => {
      try {
        const data = await getImageSize(imgUrl);
        setImageSize(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Get image size error:', error);
      }
    };

    fetchImageSize(img);
  }, [img]);

  /** Don't render if image size hasn't been fetched yet */
  if (!imageSize) {
    return <></>;
  }

  return (
    <Item
      width={imageSize.width}
      height={imageSize.height}
      cropped
      original={img}
      thumbnail={thumb}
    >
      {({ ref, open }) => (
        <>
          <Image
            // width={320}
            // height={480}
            ref={ref as Ref<HTMLDivElement>}
            onClick={(e) => {
              if (imageSize) {
                open(e);
              }
            }}
            src={thumb}
            alt={alt}
            priority="high"
            placeholder="blur"
            blurDataURL={preview}
            className="gallery-card-img relative h-80 w-full object-cover transition-transform duration-500 group-hover:scale-125"
          />
          {/* This condition will never be true since we return early if imageSize is null */}
          {!imageSize && <Spinner />}
        </>
      )}
    </Item>
  );
};

export default PortfolioCardImage;
