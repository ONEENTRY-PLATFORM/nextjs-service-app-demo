'use client';

import { useState } from 'react';

/**
 * useSlideDirection — the direction the viewer last moved through a slide list.
 *
 * Slide transitions have to know which way to travel, but the index alone does
 * not say it: a lightbox that wraps from the last photo to the first jumps the
 * index *down* while the viewer moved *forward*. The hook compares the incoming
 * index with the previous one and treats a full-length jump as a wrap, so the
 * wrapping step keeps the direction of the arrow that produced it.
 * @param   {number} index - Index of the active slide
 * @param   {number} total - Number of slides in the list
 * @returns {1 | -1}       `1` when moving forward, `-1` when moving back
 */
export const useSlideDirection = (index: number, total: number): 1 | -1 => {
  /** Index the direction was derived from, adjusted during render on a move. */
  const [seen, setSeen] = useState({ index, direction: 1 as 1 | -1 });

  if (seen.index === index) {
    return seen.direction;
  }

  const forward = index > seen.index;
  const wrapped = total > 1 && Math.abs(index - seen.index) === total - 1;
  const direction: 1 | -1 = forward !== wrapped ? 1 : -1;
  setSeen({ index, direction });

  return direction;
};
