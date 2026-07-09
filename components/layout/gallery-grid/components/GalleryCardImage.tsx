// import Image from 'next/image';
import type { JSX, Ref } from 'react';
import { useEffect, useState } from 'react';
import { Item } from 'react-photoswipe-gallery';

import getImageSize from '@/components/hooks/getImageSize';
import Image from '@/components/shared/Image';
import Spinner from '@/components/shared/Spinner';

/**
 * GalleryCardImage component to display an image in a gallery card with lightbox functionality.
 *
 * This component handles the display of gallery images with loading states and lightbox integration.
 * It fetches image dimensions for proper lightbox display and uses a low-quality image placeholder
 * for optimized loading performance. The component includes a spinner while the image is loading.
 * @param   {object}      props                  - Component properties
 * @param   {object}      props.cardData         - Object containing image data
 * @param   {string}      props.cardData.name    - Alt text for the image
 * @param   {string}      props.cardData.img     - Full-size image URL for lightbox
 * @param   {string}      props.cardData.thumb   - Thumbnail image URL for initial display
 * @param   {string}      props.cardData.preview - Low-quality image preview for placeholder
 * @returns {JSX.Element}                        JSX.Element representing the gallery card image with lightbox functionality
 */
const CardImage = ({
  cardData: { name, img, thumb, preview },
}: {
  cardData: {
    name: string;
    img: string;
    thumb: string;
    preview: string | null;
  };
}): JSX.Element => {
  /** State to store the fetched image dimensions */
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  /**
   * Subscribe to image size resolution. Cleanup flag prevents setState on
   * unmounted component if `img` changes mid-flight (React-recommended
   * pattern for async subscriptions in effects).
   */
  useEffect(() => {
    let cancelled = false;
    getImageSize(img)
      .then((data) => {
        if (!cancelled) {
          setImageSize(data);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Get image size error:', error);
      });
    return () => {
      cancelled = true;
    };
  }, [img]);

  /** Don't render if image size hasn't been fetched yet */
  if (!imageSize) {
    return <></>;
  }

  /** Always pass all props to Item to maintain consistent dependency array */
  const itemProps = {
    width: imageSize.width,
    height: imageSize.height,
    original: img,
    thumbnail: thumb,
    /** Only pass cropped when we have valid dimensions to avoid changing props count */
    ...(imageSize.width && imageSize.height ? { cropped: true } : {}),
  };

  /* Render image with lightbox functionality */
  return (
    <Item {...itemProps}>
      {({ ref, open }) => (
        <>
          <Image
            ref={ref as Ref<HTMLDivElement>}
            onClick={(e) => {
              if (imageSize) {
                open(e);
              }
            }}
            src={thumb}
            alt={name}
            placeholder={preview ? 'blur' : 'empty'}
            blurDataURL={preview || ''}
            priority={'high'}
            className="gallery-card-img relative h-80 w-full object-cover transition-transform duration-500 group-hover:scale-125"
          />
          {!imageSize && <Spinner />}
        </>
      )}
    </Item>
  );
};

export default CardImage;
