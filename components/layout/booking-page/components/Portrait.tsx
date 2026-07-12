import { User } from 'lucide-react';
import Image from 'next/image';
import type { JSX } from 'react';

import { MUTED } from '../constants';

/**
 * Portrait — the specialist photo with a neutral placeholder while the CMS
 * admin has no `master_image` uploaded.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.photo     - Photo URL (may be empty)
 * @param   {string}      props.alt       - Alt text
 * @param   {string}      props.sizes     - `next/image` sizes hint
 * @param   {string}      props.className - Extra classes of the image
 * @returns {JSX.Element}                 Portrait or placeholder
 */
const Portrait = ({
  photo,
  alt,
  sizes,
  className,
}: {
  photo: string;
  alt: string;
  sizes: string;
  className: string;
}): JSX.Element => {
  if (!photo) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#f7f7fb' }}
      >
        <User size={32} color={MUTED} />
      </div>
    );
  }
  return (
    <Image fill sizes={sizes} src={photo} alt={alt} className={className} />
  );
};

export default Portrait;
