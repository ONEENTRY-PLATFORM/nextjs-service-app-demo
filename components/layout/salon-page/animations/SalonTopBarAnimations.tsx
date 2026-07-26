'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * SalonTopBarAnimations — entrance/exit wrapper for the salon page's very top
 * elements: the gradient accent strip and the "Back to Contacts" link. Both sit
 * above the fold, so they play on mount (gated on `readyState`, once the intro
 * loader has cleared) rather than on a scroll crossing, and reverse on the
 * `next-transition-router` `leaving` stage so the header mirrors the site's
 * IN/OUT feel.
 *
 * Two modes:
 * 1. `grow` — a horizontal `scaleX` reveal from the left edge, for the strip.
 * 2. `slide` — an x-slide + fade from the left, echoing a "back" gesture, for
 * the link.
 * @param   {object}           props             - Component properties
 * @param   {ReactNode}        props.children    - Content to animate
 * @param   {'grow' | 'slide'} props.mode        - Animation style
 * @param   {string}           [props.className] - CSS classes for the wrapper element
 * @param   {CSSProperties}    [props.style]     - Optional inline styles for the wrapper
 * @param   {number}           [props.delay]     - Entrance delay in seconds
 * @returns {JSX.Element}                        Animated wrapper
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const SalonTopBarAnimations = ({
  children,
  mode,
  className,
  style,
  delay = 0,
}: {
  children: ReactNode;
  mode: 'grow' | 'slide';
  className?: string | undefined;
  style?: CSSProperties | undefined;
  delay?: number | undefined;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const [prevStage, setPrevStage] = useState('');

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Entrance timeline — plays once the loader has cleared */
  useGSAP(
    () => {
      if (!ref.current || !readyState) {
        return;
      }
      const tl = gsap.timeline({ delay });

      if (mode === 'grow') {
        tl.fromTo(
          ref.current,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.7, ease: 'power2.out' },
        );
      } else {
        tl.fromTo(
          ref.current,
          { autoAlpha: 0, x: -24 },
          { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power2.out' },
        );
      }

      return () => {
        tl.kill();
      };
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Page-transition exit timeline */
  useGSAP(
    () => {
      const tl = gsap.timeline();

      if (stage === 'leaving' && prevStage === 'none') {
        if (mode === 'grow') {
          tl.to(ref.current, {
            scaleX: 0,
            transformOrigin: 'right center',
            duration: 0.5,
            ease: 'power1.inOut',
          });
        } else {
          tl.to(ref.current, {
            autoAlpha: 0,
            x: -16,
            duration: 0.5,
            ease: 'power1.inOut',
          });
        }
      }

      setPrevStage(stage);

      return () => {
        tl.kill();
      };
    },
    { dependencies: [stage, readyState], scope: ref },
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default SalonTopBarAnimations;
