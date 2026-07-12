'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * BookingAnimations animations.
 * @param   {object}      props           - BookingAnimations props.
 * @param   {ReactNode}   props.children  - children ReactNode.
 * @param   {string}      props.className - card wrapper className.
 * @returns {JSX.Element}                 card with animations.
 * @see {@link https://gsap.com/cheatsheet/ gsap cheatsheet}
 */
const BookingAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  const { stage, isReady } = useTransitionState();
  const [prevStage, setPrevStage] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /**
   * Handle page transition animations based on stage changes
   * Controls fade in/out effects for booking form elements
   */
  useGSAP(() => {
    /** Create timeline for stage transitions */
    const stageTl = gsap.timeline();
    /** Get container and title elements for animation */
    const container = ref.current?.querySelectorAll('.mx-auto') || '';
    const title = ref.current?.querySelectorAll('.title') || '';

    /** Set initial state to hidden except for specific leaving transition */
    if (!(stage === 'leaving' && prevStage === 'none')) {
      stageTl.set([container, title], {
        autoAlpha: 0,
      });
    }

    /** Execute animations when component is ready */
    if (readyState && isReady) {
      /** Handle entering animation when stage is 'none' */
      if (
        (stage === 'none' && prevStage === '') ||
        (stage === 'none' && prevStage === 'entering') ||
        (stage === 'none' && prevStage === 'none')
      ) {
        stageTl.to([container, title], {
          autoAlpha: 1,
        });
        /** Animate elements fading in */
      } else if (stage === 'leaving' && prevStage === 'none') {
        /** Handle leaving animation */
        stageTl.to([title, container], {
          autoAlpha: 0,
          delay: 0.15,
        });
      }
    }
    /** Update previous stage state */
    setPrevStage(stage);

    /** Clean up timeline on unmount */
    return () => {
      stageTl.kill();
    };
  }, [stage, readyState, isReady]);

  return (
    <section className={className} ref={ref}>
      {children}
    </section>
  );
};

export default BookingAnimations;
