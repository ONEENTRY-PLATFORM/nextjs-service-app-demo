'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { FC, JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

interface HistoryAnimationsProps {
  children: ReactNode;
  className: string;
}

/**
 * HistoryAnimations
 *
 * A component that handles GSAP animations for page transitions in the profile history section.
 * It manages fade-in/fade-out animations based on the current transition stage and animation readiness state.
 *
 * The component uses Next.js Transition Router to detect navigation stages and applies appropriate animations:
 * - Initial load: fades in the content
 * - Entering a new page: fades in the new content
 * - Leaving current page: fades out the content
 * @param   {HistoryAnimationsProps} props           - The component props
 * @param   {ReactNode}              props.children  - The child elements to be animated
 * @param   {string}                 props.className - CSS class name for the wrapper div
 * @returns {JSX.Element}                            The wrapped children with animation capabilities
 * @see {@link https://gsap.com/cheatsheet/ GSAP Cheatsheet} for animation properties reference
 * @see {@link https://www.npmjs.com/package/next-transition-router Next Transition Router} for transition state management
 */
const HistoryAnimations: FC<HistoryAnimationsProps> = ({
  children,
  className,
}: HistoryAnimationsProps): JSX.Element => {
  /** Get the current transition stage (none, entering, leaving) from next-transition-router */
  const { stage } = useTransitionState();

  /** Create a reference to the DOM element that will be animated */
  const ref = useRef<HTMLDivElement>(null);

  /** Track the previous transition stage to determine animation direction */
  const [prevStage, setPrevStage] = useState('');

  /** Get the global animation readiness state from Redux store */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Set up GSAP animations using the useGSAP hook which integrates GSAP with React */
  useGSAP(
    () => {
      /** Create a GSAP timeline for managing the animation sequence */
      const stageTl = gsap.timeline({
        id: 'stageFromTl',
        paused: true,
      });

      /** Only execute animations when the ready state is true */
      if (readyState) {
        /** Case 1: Initial page load - no previous stage, current stage is 'none' */
        if (stage === 'none' && prevStage === '') {
          stageTl
            .set(ref.current, {
              autoAlpha: 0,
            })
            .to(ref.current, {
              autoAlpha: 1,
              duration: 0.5,
            });
          stageTl.play();
        } else if (stage === 'entering' && prevStage === 'leaving') {
          /** Case 2: Entering a new page - coming from a 'leaving' state */
          stageTl
            .set(ref.current, {
              autoAlpha: 0,
            })
            .to(ref.current, {
              autoAlpha: 1,
              duration: 0.6,
            });
          stageTl.play();
        } else if (stage === 'leaving' && prevStage === 'none') {
          /** Case 3: Leaving the current page - transitioning from 'none' to 'leaving' */
          stageTl
            .set(ref.current, {
              autoAlpha: 1,
            })
            .to(ref.current, {
              autoAlpha: 0,
              duration: 0.4,
            });
          stageTl.play();
        }
        /** Note: Other stage combinations are ignored to prevent unwanted animations */
      }

      /** Update the tracking of previous stage for the next render cycle */
      setPrevStage(stage);

      /** Cleanup function that runs when dependencies change or component unmounts */
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

export default HistoryAnimations;
