'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useContext, useRef } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Form animations component
 *
 * This component provides fade-in/fade-out animations for forms using GSAP.
 * It manages the transition states when forms are opened or closed in a drawer context.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to be animated
 * @param   {boolean}     props.isLoading - Loading state that affects animation execution
 * @param   {string}      props.className - CSS classes to apply to the container
 * @param   {boolean}     props.isActive  - Flag indicating if the form is active
 * @returns {JSX.Element}                 Animated form component
 */
const FormAnimations = ({
  children,
  isLoading,
  className,
  isActive,
}: {
  children: ReactNode;
  isLoading: boolean;
  className: string;
  isActive: boolean;
}): JSX.Element => {
  const { open, transition, setTransition } = useContext(OpenDrawerContext);
  const ref = useRef(null);

  /** Form transition animations */
  useGSAP(
    () => {
      /**
       * Early return conditions for the animation
       * Skip animation if form is not open, ref is not available,
       * component is loading, or animation is not active
       */
      if (!open || !ref.current || isLoading || !isActive) {
        return;
      }

      /**
       * Create GSAP timeline for form animations
       * Handles both forward and reverse animations with cleanup callbacks
       */
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          setTransition('');
        },
        onReverseComplete: () => {
          setTransition('');
        },
      });

      /**
       * Define animation sequence:
       * 1. Fade out the form element
       * 2. Fade in the form element
       */
      tl.from(ref.current, {
        autoAlpha: 0,
      }).to(ref.current, {
        autoAlpha: 1,
      });

      /**
       * Play or reverse animation based on transition state
       * 'close' transition reverses the animation, otherwise plays forward
       */
      if (transition === 'close') {
        tl.reverse(0.5);
      } else {
        tl.play();
      }

      /**
       * Cleanup function to kill timeline on unmount
       * Prevents memory leaks and ensures clean animation state
       */
      return () => {
        tl.kill();
      };
    },
    { dependencies: [transition, open, isLoading], scope: ref },
  );

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default FormAnimations;
