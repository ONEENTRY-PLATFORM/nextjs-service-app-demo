'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * OfferSwapAnimations — a keyed swap for the modal's exchanging panes (mock
 * `AnimatePresence mode="wait"`): whenever `swapKey` changes, the wrapper
 * fades in from a small offset. Used for the step 1 ⇄ step 2 slide and the
 * calendar ⇄ slot-grid fold.
 *
 * Follows the project's ref-wrapper convention: the tween targets the
 * wrapper's own root — no class selectors, no markup contract with children.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.swapKey     - Pane identity; a change replays the entrance
 * @param   {number}      [props.dx]        - Horizontal offset the pane slides in from (px)
 * @param   {number}      [props.dy]        - Vertical offset the pane slides in from (px)
 * @param   {string}      [props.className] - Classes of the wrapper element
 * @param   {ReactNode}   props.children    - Pane content
 * @returns {JSX.Element}                   Animated wrapper
 */
const OfferSwapAnimations = ({
  swapKey,
  dx = 0,
  dy = 0,
  className = '',
  children,
}: {
  swapKey: string;
  dx?: number;
  dy?: number;
  className?: string;
  children: ReactNode;
}): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, x: dx, y: dy },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.18, ease: 'power2.out' },
      );
    },
    { dependencies: [swapKey], scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default OfferSwapAnimations;
