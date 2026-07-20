'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * Form field animations component with GSAP timeline animation.
 *
 * This component handles the entrance animation for form fields with a staggered effect.
 * Each field simply fades in, one after another, with the delay derived from
 * its index — no width, transform or clipping is involved, so nothing inside
 * the field (chevrons, hints, password toggles) is cut off while animating.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to be animated (typically form fields)
 * @param   {string}      props.className - CSS class name to apply to the container div
 * @param   {number}      props.index     - Index of the element used to calculate staggered animation delay
 * @returns {JSX.Element}                 Rendered component with animation capabilities
 * @example
 * <FormFieldAnimations index={0} className="field-container">
 *   <input type="text" placeholder="Name" />
 * </FormFieldAnimations>
 */
const FormFieldAnimations = ({
  children,
  className,
  index,
}: {
  children: ReactNode;
  className: string;
  index: number;
}): JSX.Element => {
  const ref = useRef(null);

  /**
   * Trigger timeline animation for form field elements
   * Controls the entrance animation of each form field with staggered delays
   */
  useGSAP(
    () => {
      /**
       * Early return if DOM reference is not available
       * Ensures the animation only runs when the element is mounted
       */
      if (!ref.current) {
        return;
      }

      /**
       * Create the main timeline for form field animation
       * This timeline controls the opacity transition
       */
      const triggerTl = gsap.timeline({
        paused: true,
      });

      /**
       * Fade the field in, staggered by its index so the fields appear one
       * after another.
       */
      triggerTl.fromTo(
        ref.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          delay: index * 0.06 + 0.1,
        },
      );

      /** Play the entry animation on mount */
      triggerTl.play();

      /**
       * Cleanup function to prevent memory leaks
       * Kills the timeline when component unmounts
       */
      return () => {
        triggerTl.kill();
      };
    },
    { dependencies: [], scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default FormFieldAnimations;
