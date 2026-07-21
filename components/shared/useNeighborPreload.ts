'use client';

import { useEffect } from 'react';

/**
 * useNeighborPreload — warms the browser cache with the slides next to the
 * active one.
 *
 * Lightbox photos are full-size originals, so pressing "next" normally starts
 * the download only at that moment and the stage sits on its blur placeholder
 * for a beat. Fetching the immediate neighbours while the viewer looks at the
 * current photo makes the common case (stepping one photo at a time) instant,
 * without pulling the whole gallery over the wire.
 * @param   {string[]} urls  - Full-size sources of every slide
 * @param   {number}   index - Index of the active slide
 * @returns {void}
 */
export const useNeighborPreload = (urls: string[], index: number): void => {
  useEffect(() => {
    const total = urls.length;
    if (total < 2) {
      return;
    }
    const neighbors = [
      urls[(index + 1) % total],
      urls[(index - 1 + total) % total],
    ];
    neighbors.forEach((url) => {
      if (url) {
        const image = new window.Image();
        image.src = url;
      }
    });
  }, [urls, index]);
};
