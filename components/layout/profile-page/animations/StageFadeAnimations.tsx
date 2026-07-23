'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/** Per-stage fade durations; an omitted stage falls back to the GSAP default. */
interface StageDurations {
  load?: number;
  enter?: number;
  leave?: number;
}

/**
 * StageFadeAnimations — fade-in/out on route transitions for a profile column.
 *
 * Merges the former `FromAnimations` (profile card) and `HistoryAnimations`
 * (visit history): they were byte-identical apart from the fade durations, so
 * the durations are now the only prop. Omitting `durations` reproduces
 * `FromAnimations` exactly (every fade runs at the GSAP default); the visit
 * history passes `{ load: 0.5, enter: 0.6, leave: 0.4 }` for its slower feel.
 *
 * The three handled stage pairs (initial load, entering after leaving, leaving
 * from none) match the reference; any other pair is ignored so a mid-transition
 * render does not re-trigger a fade.
 * @param   {object}         props             - Component props
 * @param   {ReactNode}      props.children    - Elements to animate
 * @param   {string}         props.className   - Classes for the wrapper div
 * @param   {StageDurations} [props.durations] - Per-stage fade durations (default: GSAP default)
 * @returns {JSX.Element}                      Wrapper that fades its children on transitions
 * @see {@link https://gsap.com/cheatsheet/ GSAP Cheatsheet}
 */
const StageFadeAnimations = ({
  children,
  className,
  durations,
}: {
  children: ReactNode;
  className: string;
  durations?: StageDurations;
}): JSX.Element => {
  /** Current transition stage from the global router state */
  const { stage } = useTransitionState();
  /** The animated DOM element */
  const ref = useRef<HTMLDivElement>(null);
  /** Previous stage, to read the direction of the transition */
  const [prevStage, setPrevStage] = useState('');
  /** Animation readiness from the Redux store (loader gate) */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  useGSAP(
    () => {
      const stageTl = gsap.timeline({ id: 'stageFromTl', paused: true });

      /**
       * Fade the element between two `autoAlpha` values, applying a stage
       * duration only when one was given (so an omitted duration keeps the GSAP
       * default, matching the former `FromAnimations`).
       * @param   {number} from      - Start `autoAlpha`
       * @param   {number} to        - End `autoAlpha`
       * @param   {number} [seconds] - Fade duration
       * @returns {void}
       */
      const fade = (from: number, to: number, seconds?: number) => {
        stageTl.set(ref.current, { autoAlpha: from }).to(ref.current, {
          autoAlpha: to,
          ...(seconds != null ? { duration: seconds } : {}),
        });
        stageTl.play();
      };

      if (readyState) {
        /** Initial page load: fade the content in */
        if (stage === 'none' && prevStage === '') {
          fade(0, 1, durations?.load);
        }
        /** Entering a new page (after leaving the old one): fade in */
        else if (stage === 'entering' && prevStage === 'leaving') {
          fade(0, 1, durations?.enter);
        }
        /** Leaving the current page: fade out */
        else if (stage === 'leaving' && prevStage === 'none') {
          fade(1, 0, durations?.leave);
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

export default StageFadeAnimations;
