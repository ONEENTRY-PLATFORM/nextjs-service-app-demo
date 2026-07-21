'use client';

import type { JSX } from 'react';

/**
 * LightboxCounter — the `x / N` pill in the top-left corner of a fullscreen
 * viewer.
 * @param   {object}      props        - Component properties
 * @param   {number}      props.index  - Index of the photo on screen (0-based)
 * @param   {number}      props.total  - Number of photos in the set
 * @param   {string}      [props.tone] - Text color (default `rgba(255,255,255,0.6)`)
 * @returns {JSX.Element}              Counter pill
 */
const LightboxCounter = ({
  index,
  total,
  tone = 'rgba(255,255,255,0.6)',
}: {
  index: number;
  total: number;
  tone?: string | undefined;
}): JSX.Element => (
  <div
    className="absolute top-5 left-5 rounded-full px-3 py-1.5 text-xs font-medium"
    style={{ background: 'rgba(255,255,255,0.08)', color: tone }}
  >
    {index + 1} / {total}
  </div>
);

export default LightboxCounter;
