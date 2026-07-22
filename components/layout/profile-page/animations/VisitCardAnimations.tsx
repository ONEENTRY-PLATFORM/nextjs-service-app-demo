'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useContext, useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

import VisitOpenContext from './VisitOpenContext';

/** Per-card stagger step, capped so late cards do not wait out a long delay. */
const STAGGER_STEP = 0.07;
const STAGGER_MAX = 6;

/**
 * VisitCardAnimations — entrance/exit wrapper for one card of the visit history
 * (a master card or an order card). It covers the two moments such a card
 * appears and disappears:
 *
 * 1. Section toggle — the enclosing `VisitSection` collapses with a CSS grid
 * trick that keeps its children mounted, so the card takes its open/closed
 * state from {@link VisitOpenContext} and slides + fades in on open, out on
 * close, staggered by `index`.
 * 2. Page transition — on the `next-transition-router` `leaving` stage the card
 * fades and scales away, and plays back in on `entering`. Cards of a collapsed
 * section stay hidden and are skipped.
 *
 * Replaces the plain `CardAnimations` used here before, whose `scale: 0` pop
 * ignored the accordion entirely.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Card content to animate
 * @param   {string}      props.className - CSS classes for the wrapper element
 * @param   {number}      props.index     - Card index in the section, for the stagger
 * @returns {JSX.Element}                 Animated wrapper around the card
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const VisitCardAnimations = ({
  children,
  className,
  index,
}: {
  children: ReactNode;
  className: string;
  index: number;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const [prevStage, setPrevStage] = useState('');

  /** Expanded state of the enclosing history section */
  const open = useContext(VisitOpenContext);

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Delay of this card inside its section */
  const delay = Math.min(index, STAGGER_MAX) * STAGGER_STEP;

  /** Section open/close timeline — also covers the first paint of the card */
  useGSAP(
    () => {
      if (!ref.current || !readyState) {
        return;
      }
      const openTl = gsap.timeline();

      if (open) {
        openTl.fromTo(
          ref.current,
          { autoAlpha: 0, y: 24, scale: 0.97 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            delay,
            ease: 'power2.out',
          },
        );
      } else {
        /**
         * Collapsing: fade the card out slightly faster than the 200ms grid
         * collapse of the section, so the content is gone before the row height
         * finishes shrinking instead of being clipped mid-flight.
         */
        openTl.to(ref.current, {
          autoAlpha: 0,
          y: -12,
          scale: 0.98,
          duration: 0.18,
          ease: 'power1.in',
        });
      }

      return () => {
        openTl.kill();
      };
    },
    { dependencies: [open, readyState], scope: ref },
  );

  /** Page-transition timeline */
  useGSAP(
    () => {
      const stageTl = gsap.timeline();

      /** Entering after a leave — the tree survived the navigation */
      const enter = stage === 'entering' && prevStage === 'leaving';
      /** Leaving the profile page */
      const leaving = stage === 'leaving' && prevStage === 'none';

      /** Cards of a collapsed section are already hidden — nothing to play */
      if (readyState && open) {
        if (enter) {
          stageTl.fromTo(
            ref.current,
            { autoAlpha: 0, y: 24, scale: 0.97 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              delay,
              ease: 'power2.out',
            },
          );
        } else if (leaving) {
          stageTl.to(ref.current, {
            autoAlpha: 0,
            y: 16,
            scale: 0.95,
            duration: 0.45,
            delay,
            ease: 'power1.inOut',
          });
        }
      }

      setPrevStage(stage);

      return () => {
        stageTl.kill();
      };
    },
    { dependencies: [stage, readyState], scope: ref },
  );

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default VisitCardAnimations;
