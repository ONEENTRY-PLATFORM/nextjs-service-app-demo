import type { JSX } from 'react';

import Image from '@/components/shared/Image';

/**
 * MasterPortrait component — the specialist's portrait photo.
 *
 * Renders the master image inside a fixed 290×340 rounded frame with
 * `object-cover object-top` cropping, matching the reference design. When no
 * image source is available (or the file fails to load) the shared Image
 * paints the centered brand-logo placeholder rather than a broken image.
 * @param   {object}      props             - Component properties.
 * @param   {string}      props.imageSrc    - Source URL of the portrait image.
 * @param   {string}      props.alt         - Alternative text for the image.
 * @param   {string}      [props.imageBlur] - Ready-made CMS LQIP (`previewLink`) shown while the portrait loads.
 * @returns {JSX.Element}                   JSX.Element representing the master portrait.
 */
const MasterPortrait = ({
  imageSrc,
  alt,
  imageBlur,
}: {
  imageSrc: string;
  alt: string;
  imageBlur?: string | undefined;
}): JSX.Element => {
  return (
    <div
      className="item relative w-full overflow-hidden bg-slate-100"
      style={{ maxWidth: 290, height: 340, borderRadius: 15 }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        sizes="290px"
        priority="high"
        placeholder={imageBlur ? 'blur' : 'empty'}
        {...(imageBlur ? { blurDataURL: imageBlur } : {})}
        className="absolute inset-0"
        imageClassName="object-top"
      />
    </div>
  );
};

export default MasterPortrait;
