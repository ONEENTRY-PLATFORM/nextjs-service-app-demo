'use client';

import { gsap } from 'gsap';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useRef } from 'react';

/** Pointer handlers to spread onto the draggable element. */
type SlideDragHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
};

/**
 * useSlideDrag — pointer-drag paging for a slide element.
 *
 * The slide follows the finger (damped, so it reads as resistance rather than
 * free movement) and pages when the drag passes a share of the slide width;
 * a shorter drag springs back. Pointer events cover mouse, touch and pen with
 * one code path, and the element keeps `touch-action: pan-y` so a vertical
 * swipe still scrolls the page.
 *
 * Paging is handed back to the caller (`onPrev`/`onNext`) rather than animated
 * here: a page turn changes the active index, and the resulting slide-key change
 * is what drives the exit/enter transition.
 * @param   {object}                      props           - Hook properties
 * @param   {RefObject<HTMLElement|null>} props.ref       - Element that is dragged
 * @param   {() => void}                  [props.onPrev]  - Page to the previous slide
 * @param   {() => void}                  [props.onNext]  - Page to the next slide
 * @param   {number}                      [props.damping] - Share of the pointer travel the slide follows
 * @returns {SlideDragHandlers}                           Handlers to spread onto the element
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
export const useSlideDrag = ({
  ref,
  onPrev,
  onNext,
  damping = 0.55,
}: {
  ref: RefObject<HTMLElement | null>;
  onPrev?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
  damping?: number | undefined;
}): SlideDragHandlers => {
  /** Pointer that started the drag and where it went down. */
  const drag = useRef<{ id: number; startX: number } | null>(null);

  /**
   * Distance travelled by the pointer, or `null` when the event belongs to
   * another pointer than the one that started the drag.
   * @param   {ReactPointerEvent<HTMLElement>} event - Pointer event
   * @returns {number | null}                        Horizontal travel in px
   */
  const travelOf = (event: ReactPointerEvent<HTMLElement>): number | null => {
    const active = drag.current;
    return active && active.id === event.pointerId
      ? event.clientX - active.startX
      : null;
  };

  /**
   * Settle the slide back at rest, used when the drag was too short to page.
   * @returns {void}
   */
  const springBack = (): void => {
    if (ref.current) {
      gsap.to(ref.current, { x: 0, duration: 0.25, ease: 'power2.out' });
    }
  };

  return {
    onPointerDown: (event) => {
      if (!onPrev && !onNext) {
        return;
      }
      drag.current = { id: event.pointerId, startX: event.clientX };
      event.currentTarget.setPointerCapture(event.pointerId);
    },

    onPointerMove: (event) => {
      const travel = travelOf(event);
      if (travel === null || !ref.current) {
        return;
      }
      gsap.set(ref.current, { x: travel * damping });
    },

    onPointerUp: (event) => {
      const travel = travelOf(event);
      drag.current = null;
      if (travel === null) {
        return;
      }
      /** A page turn costs 15% of the slide width, never more than 90px. */
      const width = ref.current?.offsetWidth ?? 0;
      const threshold = Math.min(90, Math.max(40, width * 0.15));

      if (travel <= -threshold && onNext) {
        onNext();
      } else if (travel >= threshold && onPrev) {
        onPrev();
      } else {
        springBack();
      }
    },

    onPointerCancel: () => {
      drag.current = null;
      springBack();
    },
  };
};
