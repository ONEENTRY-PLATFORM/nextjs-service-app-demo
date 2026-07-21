/**
 * The three states of the hero's wave-shaped reveal mask (`#hero_mask`).
 *
 * The reveal tweens the `d` attribute between them, so all three must describe
 * the same path with the same node count — only the y-coordinates differ. They
 * live here rather than inline because the sequence is written out five times
 * across the reveal, the leave and the re-cover, and a typo in any one copy
 * fails silently as a jump instead of a wave.
 */

/** Fully covering — the mask hides the hero (and the header behind it). */
export const HERO_MASK_CLOSED = 'M0 1005S175 995 500 995s500 5 500 5V0H0Z';

/** Mid-wave — the crest the reveal passes through. */
export const HERO_MASK_MID = 'M0 502S175 272 500 272s500 230 500 230V0H0Z';

/** Fully open — the mask is off-screen and the hero is visible. */
export const HERO_MASK_OPEN = 'M0 2S175 1 500 1s500 1 500 1V0H0Z';
