'use client';

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { useNeighborPreload } from '@/components/shared/useNeighborPreload';
import { useSlideDirection } from '@/components/shared/useSlideDirection';

import { useLightboxTransition } from './useLightboxTransition';

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
 * Closing is animated: Escape and the returned `requestClose` both route through
 * `useLightboxTransition`, which plays the exit tween before `onClose` unmounts
 * the viewer. A stable indirection (`closeRef`) lets the a11y hook — wired below,
 * before the animated closer exists — still reach it.
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

  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * Escape closes through the a11y hook, which is created below — before the
   * animated `requestClose` exists. This stable indirection forwards to whatever
   * closer is current, so Escape animates the exit just like the close button.
   * It starts on the raw `onClose` and is re-pointed at the animated closer in an
   * effect (never during render — see the assignment below).
   */
  const closeRef = useRef(onClose);
  const routedClose = useCallback(() => closeRef.current(), []);

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

  const dialogRef = useDialogA11y({ isOpen: true, onClose: routedClose });

  const { requestClose } = useLightboxTransition({
    overlayRef: dialogRef,
    contentRef,
    onClose,
  });
  /**
   * Re-point the indirection after commit, not during render: a ref written while
   * rendering is invisible to a concurrent re-render that discards this pass, and
   * React flags it. The same latest-ref idiom `useLightboxTransition` uses for its
   * own `onClose`; effects flush before any keypress can reach the dialog, so
   * Escape never lands on the raw closer.
   */
  useEffect(() => {
    closeRef.current = requestClose;
  });

  return { direction, dialogRef, contentRef, requestClose };
};
