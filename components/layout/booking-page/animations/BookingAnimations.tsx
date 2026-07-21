'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * BookingAnimations animations.
 *
 * Fades the wizard body in and out across page transitions. The hero header is
 * intentionally left alone — `HeroAnimations` inside `BookingHero` fully drives
 * the kicker/title/subtitle, so the booking header animates identically to the
 * services and contacts heroes.
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
  useGSAP(
    () => {
      /** Create timeline for stage transitions */
      const stageTl = gsap.timeline();
      /**
       * The wrapper element itself is the fade target — it holds nothing but
       * the wizard. It used to be selected as `.mx-auto`, which matched a
       * Tailwind utility rather than a hook: inside the wizard that class also
       * sits on every calendar day button and on the success-modal icon, so the
       * transition faded them too. The hero is driven by `HeroAnimations`.
       */
      const container = ref.current;

      /** Set initial state to hidden except for specific leaving transition */
      if (!(stage === 'leaving' && prevStage === 'none')) {
        stageTl.set(container, {
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
          stageTl.to(container, {
            autoAlpha: 1,
          });
          /** Animate elements fading in */
        } else if (stage === 'leaving' && prevStage === 'none') {
          /** Handle leaving animation */
          stageTl.to(container, {
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
    },
    { dependencies: [stage, readyState, isReady], scope: ref },
  );

  return (
    <section className={className} ref={ref}>
      {children}
    </section>
  );
};

export default BookingAnimations;
