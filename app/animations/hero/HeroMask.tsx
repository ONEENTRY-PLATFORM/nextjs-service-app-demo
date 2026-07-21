'use client';

import type { JSX } from 'react';

import { HERO_MASK_CLOSED } from './heroMaskPaths';

/**
 * HeroMask — the decorative wave that covers the hero and uncovers it on
 * arrival. `HeroAnimations` tweens its path between the states in
 * `heroMaskPaths`; it starts fully covering.
 *
 * `pointer-events-none` is required: the full-size `<svg>` box sits above the
 * hero (`z-50`) and would otherwise swallow every click on the slider arrows,
 * dots and CTA button.
 * @returns {JSX.Element} Mask overlay
 */
const HeroMask = (): JSX.Element => (
  <svg
    id="hero_mask"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
    className="pointer-events-none"
  >
    <path fill="#ffffff" className="mask_path" d={HERO_MASK_CLOSED} />
  </svg>
);

export default HeroMask;
