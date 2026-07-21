'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * SwapAnimations — exit-then-enter wrapper for content that is replaced in
 * place (filtered lists, tabbed panels). Without it a filter change swaps the
 * DOM instantly, so the old items vanish abruptly and only the new ones get an
 * entrance — the asymmetry reads as a glitch.
 *
 * While `swapKey` is unchanged the children render through untouched. When it
 * changes the wrapper keeps rendering the *previous* children, fades them out,
 * and only then commits the new ones (their own entrance wrapper — e.g.
 * `GridItemAnimations` — takes over from there). Trigger positions are
 * recomputed a frame after the commit, since the new content changes the page
 * height.
 * @param   {object}        props             - Component properties
 * @param   {ReactNode}     props.children    - Content to swap
 * @param   {string}        props.swapKey     - Signature of the current content; a change starts the swap
 * @param   {string}        [props.className] - CSS classes for the wrapper element
 * @param   {CSSProperties} [props.style]     - Optional inline styles for the wrapper
 * @param   {number}        [props.duration]  - Exit duration in seconds
 * @returns {JSX.Element}                     Animated wrapper around the swapped content
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const SwapAnimations = ({
  children,
  swapKey,
  className,
  style,
  duration = 0.28,
}: {
  children: ReactNode;
  swapKey: string;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  duration?: number | undefined;
}): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * The children currently on screen, together with the key they belong to.
   *
   * The outgoing tree only exists in the *previous* render, so it has to be
   * carried across renders. That is state, not a ref: reading a ref while
   * rendering is exactly what React forbids (the value would not participate
   * in rendering and the wrapper could show stale content).
   */
  const [committed, setCommitted] = useState<{
    key: string;
    node: ReactNode;
  }>({ key: swapKey, node: children });
  const stale = committed.key !== swapKey;

  /**
   * While nothing is swapping the snapshot tracks the live children, so it
   * always holds the tree that is about to become the outgoing one. This is
   * React's "adjusting state when a prop changes" pattern — a render-phase
   * update that React re-runs immediately, without committing the in-between
   * result.
   */
  if (!stale && committed.node !== children) {
    setCommitted({ key: swapKey, node: children });
  }

  /** Fade the outgoing content away, then commit the incoming one */
  useEffect(() => {
    if (!stale) {
      return;
    }
    /**
     * Release the freeze by accepting the new key. Only the key is written:
     * the very next render is no longer stale, so it shows the live `children`
     * and the render-phase sync above refreshes the snapshot with them.
     * @returns {void} Nothing
     */
    const commit = (): void =>
      setCommitted((previous) => ({ ...previous, key: swapKey }));

    const element = ref.current;
    if (!element) {
      commit();
      return;
    }
    const tween = gsap.to(element, {
      autoAlpha: 0,
      y: -12,
      duration,
      ease: 'power1.in',
      onComplete: commit,
    });
    return () => {
      tween.kill();
    };
  }, [stale, swapKey, duration]);

  /** Reveal the wrapper again before the freshly committed content paints */
  useLayoutEffect(() => {
    if (ref.current) {
      gsap.set(ref.current, { autoAlpha: 1, y: 0 });
    }
  }, [committed.key]);

  /** New content means a new page height — re-measure the scroll triggers */
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [committed.key]);

  return (
    <div className={className} style={style} ref={ref}>
      {stale ? committed.node : children}
    </div>
  );
};

export default SwapAnimations;
