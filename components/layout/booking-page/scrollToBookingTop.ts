'use client';

/**
 * Height of the fixed site header (`h-20` in `app/layout.tsx`), in px — the
 * scroll target is offset by it so the block's top isn't hidden underneath.
 */
const HEADER_OFFSET = 80;

/** Extra breathing room between the header and the block's top edge, in px. */
const GAP = 12;

/**
 * scrollToBookingTop — smoothly bring the top of the booking block into view.
 *
 * The wizard steps differ a lot in height, so after Back / Continue the user is
 * often left staring at the middle (or the bottom) of the next step. Only
 * scrolls upwards: when the block's top is already above the viewport top there
 * is nothing to fix, and pulling the page down would be jarring.
 *
 * Deferred by two frames: the caller changes the step in the same click, and
 * the target must be measured against the new step's layout (the section itself
 * carries `overflow-anchor: none`, so the browser doesn't jump first).
 */
export const scrollToBookingTop = (): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById('booking-section');
      if (!el) return;

      const top = Math.max(
        el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - GAP,
        0,
      );
      if (window.scrollY <= top) return;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};
