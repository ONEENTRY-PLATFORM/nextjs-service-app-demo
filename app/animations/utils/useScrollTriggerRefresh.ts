import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useEffect } from 'react';

/**
 * useScrollTriggerRefresh — re-measure every ScrollTrigger after the content swaps.
 *
 * Changing a filter (or committing a swap) remounts a grid and changes the page
 * height, which leaves every ScrollTrigger's cached start/end stale — cards that
 * stay in view can freeze at their hidden entrance state. Recompute all trigger
 * positions once the new content has laid out (next frame), letting the in-view
 * cards fire their reveal.
 *
 * This is deliberately NOT the same fix as the synchronous `ScrollTrigger.refresh()`
 * some `useGSAP` bodies run: this one waits a frame because the new DOM has not
 * been measured yet at effect time.
 * @param   {unknown} contentKey - Value that changes whenever the rendered content does
 * @returns {void}
 */
export const useScrollTriggerRefresh = (contentKey: unknown): void => {
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [contentKey]);
};
