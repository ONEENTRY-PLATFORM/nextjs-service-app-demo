import type { JSX } from 'react';

import Image from '@/components/shared/Image';

/**
 * Portrait — the specialist photo of the booking cards. Delegates to the
 * shared {@link Image}, which paints the centered brand-logo placeholder while
 * the CMS admin has no `master_image` uploaded or the file fails to load.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.photo     - Photo URL (may be empty)
 * @param   {string}      props.alt       - Alt text
 * @param   {string}      props.sizes     - `next/image` sizes hint
 * @param   {string}      props.className - Extra classes of the image
 * @param   {string}      [props.blur]    - Ready-made CMS LQIP (`previewLink`) shown while the photo loads
 * @returns {JSX.Element}                 Portrait or placeholder
 */
const Portrait = ({
  photo,
  alt,
  sizes,
  className,
  blur,
}: {
  photo: string;
  alt: string;
  sizes: string;
  className: string;
  blur?: string | undefined;
}): JSX.Element => (
  <Image
    sizes={sizes}
    src={photo}
    alt={alt}
    placeholder={blur ? 'blur' : 'empty'}
    {...(blur ? { blurDataURL: blur } : {})}
    className="absolute inset-0"
    imageClassName={className}
  />
);

export default Portrait;
