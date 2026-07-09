'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * ProfileCard animations
 * @param   {object}      props           - props
 * @param   {ReactNode}   props.children  - children ReactNode
 * @param   {string}      props.className - card wrapper className
 * @param   {number}      props.index     - index of element in array for stagger
 * @returns {JSX.Element}                 card with animations
 * @see {@link https://gsap.com/cheatsheet/ gsap cheatsheet}
 */
const CardAnimations = ({
  children,
  className,
  index,
}: {
  children: ReactNode;
  className: string;
  index: number;
}): JSX.Element => {
  /** Get the current transition stage from the global state */
  const { stage } = useTransitionState();

  /** Track the previous stage to determine transition direction */
  const [prevStage, setPrevStage] = useState('');

  /** Reference to the DOM element for GSAP animations */
  const ref = useRef(null);

  /** Check if animations are ready to be played */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** stageTl - Timeline for handling stage transitions with GSAP */
  useGSAP(() => {
    /** Exit early if the element reference is not available or animations are not ready */
    if (!ref.current || !readyState) {
      return;
    }

    /** Determine the type of transition occurring */
    const first = stage === 'none' && prevStage === ''; // Initial load
    const enter = stage === 'entering' && prevStage === 'leaving'; // Entering after leaving
    const leaving = stage === 'leaving' && prevStage === 'none'; // Leaving the current stage

    /** Create a GSAP timeline for the animation sequence */
    const stageTl = gsap.timeline({
      id: 'stageProfileCardTl',
    });

    /** first loading - Animate cards in on initial page load */
    if (first) {
      stageTl.fromTo(
        ref.current,
        {
          scale: 0,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          delay: index / 10,
        },
      );
    }
    // enter stage - Animate cards in when entering a new stage
    else if (enter) {
      stageTl.fromTo(
        ref.current,
        {
          scale: 0,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          delay: index / 10,
        },
      );
    }
    // leaving stage - Animate cards out when leaving the current stage
    else if (leaving) {
      stageTl.to(ref.current, {
        scale: 0,
        duration: 0.5,
        delay: index / 10,
        ease: 'power1.inOut',
      });
    }

    /** Update the previous stage to the current stage */
    setPrevStage(stage);

    /** Cleanup function to kill the timeline when the component unmounts or stage changes */
    return () => {
      stageTl.kill();
    };
  }, [stage]);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default CardAnimations;
