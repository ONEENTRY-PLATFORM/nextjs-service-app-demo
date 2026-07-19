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
  const { open, transition, direction } = useContext(OpenDrawerContext);
  const ref = useRef(null);

  /** Form step-enter animation (horizontal slide + fade) */
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
       * On close the whole modal animates out via `ModalAnimations`; the form
       * just holds still, so there is nothing to play here.
       */
      if (transition === 'close') {
        return;
      }

      /**
       * Each form step is a fresh mount (the modal swaps `component`), so we
       * only play the ENTER: slide in from the right on a forward step
       * (Sign In → Sign Up / Reset) or from the left on a backward step
       * (Sign Up → Sign In), matching the static-html AuthModal step slide.
       */
      const dx = direction === 'backward' ? -1 : 1;
      const tween = gsap.fromTo(
        ref.current,
        { autoAlpha: 0, x: dx * 32 },
        { autoAlpha: 1, x: 0, duration: 0.28, ease: 'power2.out' },
      );

      /**
       * Cleanup function to kill the tween on unmount
       * Prevents memory leaks and ensures clean animation state
       */
      return () => {
        tween.kill();
      };
    },
    { dependencies: [transition, open, isLoading, direction], scope: ref },
  );

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default FormAnimations;
