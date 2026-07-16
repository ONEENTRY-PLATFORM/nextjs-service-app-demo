'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * FromAnimations
 *
 * A component that provides fade-in/fade-out animations for page transitions using GSAP.
 * This component handles different transition stages and animates the opacity of its children
 * based on the current and previous transition states.
 * @param   {object}      props           - Component props
 * @param   {ReactNode}   props.children  - Child elements to be animated
 * @param   {string}      props.className - CSS classes to apply to the wrapper div element
 * @returns {JSX.Element}                 - Rendered component with animation capabilities
 * @see {@link https://gsap.com/cheatsheet/ GSAP Cheatsheet} for animation properties and methods
 * @see {@link https://www.npmjs.com/package/next-transition-router next-transition-router} for transition state management
 */
const FromAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Get the current transition stage from the global router state */
  const { stage } = useTransitionState();

  /** Create a reference to the DOM element that will be animated */
  const ref = useRef<HTMLDivElement>(null);

  /** Track the previous transition stage to determine the direction of transition */
  const [prevStage, setPrevStage] = useState('');

  /** Get the animation readiness state from Redux store */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Set up GSAP animations that respond to transition state changes */
  useGSAP(
    () => {
      /** Create a GSAP timeline for sequencing animation steps */
      const stageTl = gsap.timeline({
        id: 'stageFromTl',
        paused: true,
      });

      /** Only execute animations when the animation system is ready */
      if (readyState) {
        /** Initial page load scenario: component appears with fade-in effect */
        if (stage === 'none' && prevStage === '') {
          stageTl
            .set(ref.current, {
              autoAlpha: 0,
            })
            .to(ref.current, {
              autoAlpha: 1,
            });
          stageTl.play();
        }
        // Navigation to a new page: fade in the new content
        else if (stage === 'entering' && prevStage === 'leaving') {
          stageTl
            .set(ref.current, {
              autoAlpha: 0,
            })
            .to(ref.current, {
              autoAlpha: 1,
            });
          stageTl.play();
        }
        // Navigation away from current page: fade out the current content
        else if (stage === 'leaving' && prevStage === 'none') {
          stageTl
            .set(ref.current, {
              autoAlpha: 1,
            })
            .to(ref.current, {
              autoAlpha: 0,
            });
          stageTl.play();
        }
      }

      /** Update the tracking of previous stage for next render cycle */
      setPrevStage(stage);

      /** Cleanup function that runs when component unmounts or dependencies change */
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

export default FromAnimations;
