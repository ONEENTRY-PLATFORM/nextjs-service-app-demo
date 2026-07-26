import type { JSX } from 'react';

import LogoIcon from './LogoIcon';

/**
 * ImagePlaceholder — the brand stand-in painted where a photo should be: the
 * muted Thalia logo centered on a light neutral field. Rendered by the shared
 * `Image` component when the source is empty or the file fails to load, so a
 * missing photo reads as intentional branding instead of the browser's
 * broken-image icon.
 *
 * Stretches over the nearest positioned ancestor (the `Image` wrapper), and the
 * logo scales with the box (half of its width, capped at the natural 110px), so
 * the same placeholder works from a 36px avatar to a full-bleed banner.
 * @returns {JSX.Element} Full-size placeholder layer with the centered logo
 */
const ImagePlaceholder = (): JSX.Element => (
  <div
    data-testid="image-placeholder"
    className="absolute inset-0 flex items-center justify-center bg-slate-100"
  >
    <LogoIcon
      className="h-auto w-1/2 max-w-27.5 opacity-40"
      fill="#a8a9b5"
      stroke="none"
    />
  </div>
);

export default ImagePlaceholder;
