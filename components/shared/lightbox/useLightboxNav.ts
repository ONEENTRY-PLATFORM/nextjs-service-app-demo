'use client';

import type { RefObject } from 'react';
import { useEffect } from 'react';

import { useAnimatedDialog } from '@/components/shared/useAnimatedDialog';
import { useNeighborPreload } from '@/components/shared/useNeighborPreload';
import { useSlideDirection } from '@/components/shared/useSlideDirection';

/**
 * What a lightbox needs wired up before it can render its chrome.
 * @property {1 | -1}                           direction    - Which way the viewer is paging — drives the stage slide transition
 * @property {RefObject<HTMLDivElement | null>} dialogRef    - Attach to the overlay element: focus trap, focus restore, scroll lock, Escape
 * @property {RefObject<HTMLDivElement | null>} contentRef   - Attach to the stage column — the element the open/close animation scales
 * @property {() => void}                       requestClose - Animated close: use for the close button, backdrop click and any dismiss
 */
export interface LightboxNav {
  direction: 1 | -1;
  dialogRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  requestClose: () => void;
}

/**
 * useLightboxNav — the wiring every fullscreen viewer repeats: the paging
 * direction for the stage transition, preloading of the neighbouring originals
 * so stepping through feels instant, arrow-key navigation, and the dialog a11y
 * ref (focus trap, focus restore, scroll lock and Escape-to-close).
 *
 * The key listener is skipped for an empty set, so a viewer rendered with no
 * photos cannot page into an out-of-range index.
 *
 * Closing is animated: Escape and the returned `requestClose` both route
 * through {@link useAnimatedDialog}, which plays the exit tween before
 * `onClose` unmounts the viewer.
 * @param   {object}      input         - Hook input
 * @param   {string[]}    input.urls    - Full-size URLs of every photo, in display order
 * @param   {number}      input.index   - Index of the photo on screen
 * @param   {() => void}  input.onPrev  - Show the previous photo
 * @param   {() => void}  input.onNext  - Show the next photo
 * @param   {() => void}  input.onClose - Close the viewer (run after the exit tween)
 * @returns {LightboxNav}               Paging direction, the dialog/stage refs and the animated closer
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

  const { dialogRef, contentRef, requestClose } = useAnimatedDialog({
    onClose,
  });

  return { direction, dialogRef, contentRef, requestClose };
};
