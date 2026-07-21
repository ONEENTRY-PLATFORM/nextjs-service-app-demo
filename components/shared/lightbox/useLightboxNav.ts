'use client';

import type { RefObject } from 'react';
import { useEffect } from 'react';

import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { useNeighborPreload } from '@/components/shared/useNeighborPreload';
import { useSlideDirection } from '@/components/shared/useSlideDirection';

/** What a lightbox needs wired up before it can render its chrome. */
export interface LightboxNav {
  /** Which way the viewer is paging — drives the stage slide transition */
  direction: 1 | -1;
  /** Attach to the overlay element: focus trap, focus restore, scroll lock, Escape */
  dialogRef: RefObject<HTMLDivElement | null>;
}

/**
 * useLightboxNav — the wiring every fullscreen viewer repeats: the paging
 * direction for the stage transition, preloading of the neighbouring originals
 * so stepping through feels instant, arrow-key navigation, and the dialog a11y
 * ref (focus trap, focus restore, scroll lock and Escape-to-close).
 *
 * The key listener is skipped for an empty set, so a viewer rendered with no
 * photos cannot page into an out-of-range index.
 * @param   {object}      input         - Hook input
 * @param   {string[]}    input.urls    - Full-size URLs of every photo, in display order
 * @param   {number}      input.index   - Index of the photo on screen
 * @param   {() => void}  input.onPrev  - Show the previous photo
 * @param   {() => void}  input.onNext  - Show the next photo
 * @param   {() => void}  input.onClose - Close the viewer
 * @returns {LightboxNav}               Paging direction and the dialog ref
 */
export const useLightboxNav = ({
  urls,
  index,
  onPrev,
  onNext,
  onClose,
}: {
  urls: string[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}): LightboxNav => {
  const direction = useSlideDirection(index, urls.length);

  useNeighborPreload(urls, index);

  const empty = urls.length === 0;
  useEffect(() => {
    if (empty) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [empty, onPrev, onNext]);

  const dialogRef = useDialogA11y({ isOpen: true, onClose });

  return { direction, dialogRef };
};
