'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useSlideDrag } from './utils/useSlideDrag';

/**
 * SlideAnimations — direction-aware exit-then-enter wrapper for a slide that is
 * replaced in place (a lightbox stage, a carousel frame).
 *
 * Swapping the source of a single image is instant in the DOM, so paging
 * through a gallery reads as a hard cut. This wrapper keeps rendering the slide
 * already on screen, pushes it out against the travel direction, and only then
 * commits the incoming one and brings it in from the opposite side, so the page
 * turn is legible.
 *
 * The slide is passed as data (`slide` + its identity `slideKey`) and rendered
 * through the `children` callback rather than as plain elements: the wrapper has
 * to keep showing the previous slide while the exit runs, and holding that slide
 * in state is what lets it do so without freezing a rendered tree.
 *
 * `direction` comes from `useSlideDirection`: `1` pages forward (the new slide
 * arrives from the right), `-1` pages back. Passing `onPrev`/`onNext` also makes
 * the slide draggable — see `useSlideDrag`.
 * @param   {object}                  props             - Component properties
 * @param   {T}                       props.slide       - Data of the current slide
 * @param   {string}                  props.slideKey    - Identity of the current slide; a change starts the transition
 * @param   {(slide: T) => ReactNode} props.children    - Renders the slide that is currently on screen
 * @param   {1 | -1}                  [props.direction] - Travel direction of the page turn
 * @param   {() => void}              [props.onPrev]    - Page to the previous slide (enables dragging)
 * @param   {() => void}              [props.onNext]    - Page to the next slide (enables dragging)
 * @param   {string}                  [props.className] - CSS classes for the wrapper element
 * @param   {CSSProperties}           [props.style]     - Optional inline styles for the wrapper
 * @param   {number}                  [props.distance]  - Travel distance in px
 * @param   {number}                  [props.duration]  - Exit duration in seconds (the entrance is slightly longer)
 * @returns {JSX.Element}                               Animated wrapper around the slide
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const SlideAnimations = <T,>({
  slide,
  slideKey,
  children,
  direction = 1,
  onPrev,
  onNext,
  className,
  style,
  distance = 44,
  duration = 0.22,
}: {
  slide: T;
  slideKey: string;
  children: (slide: T) => ReactNode;
  direction?: 1 | -1 | undefined;
  onPrev?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  distance?: number | undefined;
  duration?: number | undefined;
}): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * The slide currently on screen, together with the direction it arrived from.
   * It lags behind the props for as long as the exit animation runs.
   */
  const [committed, setCommitted] = useState({
    key: slideKey,
    slide,
    direction,
  });
  const stale = committed.key !== slideKey;

  /**
   * Latest incoming slide, read when the exit finishes. Keeping it out of the
   * effect dependencies matters: `slide` is usually a fresh object every render,
   * so depending on it would restart the exit tween on any parent re-render.
   */
  const incoming = useRef(slide);
  useEffect(() => {
    incoming.current = slide;
  }, [slide]);

  /** Push the outgoing slide away, then commit the incoming one */
  useEffect(() => {
    /**
     * Show the incoming slide, remembering which way it travelled in.
     * @returns {void}
     */
    const commit = () =>
      setCommitted({ key: slideKey, slide: incoming.current, direction });

    if (!stale) {
      return;
    }
    const element = ref.current;
    if (!element) {
      commit();
      return;
    }
    const tween = gsap.to(element, {
      autoAlpha: 0,
      x: -direction * distance,
      scale: 0.97,
      duration,
      ease: 'power2.in',
      onComplete: commit,
    });
    return () => {
      tween.kill();
    };
  }, [stale, slideKey, direction, distance, duration]);

  /** Bring the freshly committed slide in from the opposite side */
  useGSAP(
    () => {
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, x: committed.direction * distance, scale: 0.97 },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          duration: duration * 1.5,
          ease: 'power2.out',
        },
      );
    },
    { dependencies: [committed], scope: ref },
  );

  /** Drag-to-page, active only when the caller supplied paging handlers. */
  const dragHandlers = useSlideDrag({ ref, onPrev, onNext });
  const draggable = !!onPrev || !!onNext;

  return (
    <div
      className={className}
      style={{ ...(draggable ? { touchAction: 'pan-y' } : {}), ...style }}
      ref={ref}
      {...(draggable ? dragHandlers : {})}
    >
      {children(committed.slide)}
    </div>
  );
};

export default SlideAnimations;
