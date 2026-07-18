import type { JSX } from 'react';

/**
 * Avatar renders a circular user avatar: a pink brand-gradient disc with the
 * user's initial letter, or the uploaded photo when one is present.
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
  /** First letter of the name, uppercased, with a safe fallback. */
  const initial = (name.trim()[0] ?? 'U').toUpperCase();

  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold text-white"
      style={{
        background: 'linear-gradient(135deg,#f60efb,#ed21f1)',
        boxShadow: '0 4px 16px #ed21f144',
      }}
    >
      {photo ? (
        // The avatar photo is an optional URL of unknown origin; next/image's
        // remotePatterns only allows the CMS host (**.oneentry.cloud/cloud-static),
        // so a non-CMS avatar would make next/image throw at runtime. A raw
        // <img> renders any host.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="size-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
};

export default Avatar;
