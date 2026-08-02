'use client';

import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

/**
 * useNearViewport — `true` once the observed element approaches the viewport.
 *
 * The browser's native `loading="lazy"` threshold is generous: on a listing
 * with dozens of cards it fires the image optimizer for most of the page on
 * initial load. Gating the `<Image>` mount on this hook keeps the requests to
 * the cards actually near the viewport (the performance rule's
 * IntersectionObserver gate). The flag latches: once visible, the observer
 * disconnects and the element never un-mounts its image. Environments without
 * `IntersectionObserver` degrade to an immediate `true`.
 *
 * Apply to repeating listing cards only — never to heroes / above-the-fold
 * content (those want `priority`) or images inside lazily-mounted modals.
 * @param   {RefObject<Element | null>} ref                  - Ref of the element to observe (the image's aspect wrapper)
 * @param   {object}                    [options]            - Observer options
 * @param   {string}                    [options.rootMargin] - How far ahead of the viewport to trigger (default `'200px'`)
 * @returns {boolean}                                        Whether the element is near (or past) the viewport
 */
export const useNearViewport = (
  ref: RefObject<Element | null>,
  { rootMargin = '200px' }: { rootMargin?: string } = {},
): boolean => {
  /**
   * A browser without `IntersectionObserver` reveals immediately — decided in
   * the initializer (never via setState inside the effect body). The server
   * branch stays `false` so SSR output matches the common hydrated state.
   */
  const [visible, setVisible] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, visible]);

  return visible;
};
