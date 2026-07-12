import Image from 'next/image';
import type { JSX } from 'react';

/**
 * MasterPortrait component — the specialist's portrait photo.
 *
 * Renders the master image inside a fixed 290×340 rounded frame with
 * `object-cover object-top` cropping, matching the reference design. When no
 * image source is available it degrades to an empty tinted placeholder rather
 * than crashing.
 * @param   {object}      props          - Component properties.
 * @param   {string}      props.imageSrc - Source URL of the portrait image.
 * @param   {string}      props.alt      - Alternative text for the image.
 * @returns {JSX.Element}                JSX.Element representing the master portrait.
 */
const MasterPortrait = ({
  imageSrc,
  alt,
}: {
  imageSrc: string;
  alt: string;
}): JSX.Element => {
  return (
    <div
      className="item relative w-full overflow-hidden bg-slate-100"
      style={{ maxWidth: 290, height: 340, borderRadius: 15 }}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="290px"
          priority
          className="object-cover object-top"
        />
      ) : null}
    </div>
  );
};

export default MasterPortrait;
