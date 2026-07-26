'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

/**
 * The animated closer a lightbox wires to every dismiss path.
 * @property {() => void} requestClose - Play the exit animation, then run the real `onClose`. Idempotent.
 */
export interface LightboxTransition {
  requestClose: () => void;
}

/**
 * useLightboxTransition — the open/close choreography shared by every fullscreen
 * viewer. On mount it fades the backdrop in and scales the stage column up into
 * place; `requestClose` reverses that (drop + fade) and only runs the real
 * `onClose` once the exit tween finishes, so dismissing never reads as a hard
 * cut. Because the viewer is unmounted by its parent, that deferral is the only
 * window in which an exit animation can play at all.
 *
 * `requestClose` must be the handler wired to EVERY path that dismisses the
 * viewer — close button, backdrop click and Escape — or those paths would
 * unmount instantly and skip the exit.
 * @param   {object}                        input            - Hook input
 * @param   {RefObject<HTMLElement | null>} input.overlayRef - Backdrop element (the dialog root) that fades
 * @param   {RefObject<HTMLElement | null>} input.contentRef - Stage column that scales in/out
 * @param   {() => void}                    input.onClose    - Real close, run after the exit tween
 * @returns {LightboxTransition}                             The animated closer
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
export const useLightboxTransition = ({
  overlayRef,
  contentRef,
  onClose,
}: {
  overlayRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}): LightboxTransition => {
  /** Latest onClose, kept in a ref so `requestClose` stays referentially stable. */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  /** Guards the exit against re-entry (double click, click during Escape). */
  const closing = useRef(false);

  /** Entrance: fade the backdrop in while the stage column scales up. */
  useGSAP(() => {
    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
      );
    }
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'power3.out' },
      );
    }
  });

  const requestClose = useCallback(() => {
    if (closing.current) {
      return;
    }
    closing.current = true;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay && !content) {
      onCloseRef.current();
      return;
    }
    const tl = gsap.timeline({ onComplete: () => onCloseRef.current() });
    if (content) {
      tl.to(
        content,
        {
          autoAlpha: 0,
          scale: 0.94,
          y: 20,
          duration: 0.26,
          ease: 'power2.in',
          overwrite: true,
        },
        0,
      );
    }
    if (overlay) {
      tl.to(
        overlay,
        { autoAlpha: 0, duration: 0.3, ease: 'power2.in', overwrite: true },
        0,
      );
    }
  }, [overlayRef, contentRef]);

  return { requestClose };
};
