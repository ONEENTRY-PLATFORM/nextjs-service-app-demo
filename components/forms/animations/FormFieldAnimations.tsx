'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * Form field animations component with GSAP timeline animation.
 *
 * This component handles the entrance animation for form fields with a staggered effect.
 * Each field animates from zero width and opacity to full width and opacity,
 * creating a sequential reveal effect based on the index.
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
       * Set initial transform properties for smooth animation
       * Establishes the origin point and prevents content overflow during animation
       */
      gsap.set(ref.current, {
        transformOrigin: '0 0',
        overflow: 'hidden',
      });

      /**
       * Create the main timeline for form field animation
       * This timeline controls the width and opacity transitions
       */
      const triggerTl = gsap.timeline({
        paused: true,
      });

      /**
       * Define the animation sequence:
       * - Start with zero width and opacity
       * - Animate to full width and full opacity
       * - Apply staggered delay based on field index for sequential appearance
       */
      triggerTl.fromTo(
        ref.current,
        {
          width: 0,
          opacity: 0,
        },
        {
          width: '100%',
          opacity: 1,
          delay: index / 10 + 0.35,
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
