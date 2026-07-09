'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * LoaderAnimations component to add entrance animations to loader elements.
 *
 * This component uses GSAP to create entrance animations for skeleton loader elements.
 * It applies a scaling and fade-in effect to child elements with the class 'item'.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to apply animations to
 * @param   {string}      props.className - CSS classes to apply to the wrapper element
 * @returns {JSX.Element}                 JSX.Element with animated children
 * @see {@link https://gsap.com/cheatsheet/ gsap cheatsheet}
 */
const LoaderAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Create ref for the loader container element */
  const ref = useRef<HTMLDivElement>(null);

  /** Setup initial loader animations */
  useGSAP(
    () => {
      /** Get all items with 'item' class for animation */
      const items = ref.current?.querySelectorAll('.item') || [];

      /** Create timeline for loader animation sequence */
      const stageTl = gsap.timeline();

      /** Define animation sequence: scale and fade in items with stagger */
      stageTl.fromTo(
        [...items],
        {
          autoAlpha: 0,
          scaleX: 0,
          transformOrigin: 'left center',
        },
        {
          autoAlpha: 1,
          scaleX: 1,
          duration: 0.35,
          stagger: 0.1,
        },
      );

      /** Cleanup function to kill timeline on unmount */
      return () => {
        stageTl.kill();
      };
    },
    { scope: ref },
  );

  /** Render animated loader container */
  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default LoaderAnimations;
