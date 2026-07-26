'use client';

import type { JSX } from 'react';
import { useState } from 'react';

/**
 * Avatar renders a circular user avatar: a pink brand-gradient disc with the
 * user's initial letter, or the uploaded photo when one is present. A photo
 * that fails to load falls back to the initial disc instead of the browser's
 * broken-image icon.
 * @param   {object}      props         - Component props
 * @param   {string}      props.name    - User's display name (its first letter is used)
 * @param   {string}      [props.photo] - Optional photo URL to render instead of the initial
 * @returns {JSX.Element}               Circular avatar element
 */
const Avatar = ({
  name,
  photo,
}: {
  name: string;
  photo?: string | undefined;
}): JSX.Element => {
  /** Set when the photo URL errors out — the initial disc takes over. */
  const [failed, setFailed] = useState(false);
  /** First letter of the name, uppercased, with a safe fallback. */
  const initial = (name.trim()[0] ?? 'U').toUpperCase();

  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-xl font-bold text-white"
      style={{ boxShadow: '0 4px 16px #ed21f144' }}
    >
      {photo && !failed ? (
        // The avatar photo is an optional URL of unknown origin; next/image's
        // remotePatterns only allows the CMS host (**.oneentry.cloud/cloud-static),
        // so a non-CMS avatar would make next/image throw at runtime. A raw
        // <img> renders any host.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );
};

export default Avatar;
