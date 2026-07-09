'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * ReviewsAnimations component adds animation effects to child elements
 * When the component enters the viewport, fade-in animations are applied to arrows and slide items
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child components to apply animations to
 * @param   {string}      props.className - CSS class name to apply to the wrapper element
 * @returns {JSX.Element}                 JSX.Element - Wrapper component with animation functionality
 */
const ReviewsAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Create ref for the reviews container element */
  const ref = useRef<HTMLDivElement>(null);

  /** Set up scroll-triggered animations for reviews */
  useGSAP(() => {
    /** Exit early if ref is not attached */
    if (!ref.current) {
      return;
    }
    /** Create GSAP timeline and set up scroll trigger */
    const tl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: ref.current,
        toggleActions: 'restart reverse restart reverse',
        start: 'top bottom',
        end: 'bottom top',
      },
    });

    /** Select arrow elements for animation */
    const arrows = ref.current.querySelectorAll('.arrow');
    /** Select slide items for animation */
    const items = ref.current.querySelectorAll('.slide');

    /** Add fade-in animation to arrow elements */
    if (arrows) {
      tl.fromTo(
        arrows,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.25,
        },
      );
    }

    /** Add fade-in animation to slide items */
    if (items) {
      tl.fromTo(
        items,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.15,
        },
      );
    }

    /** Clean up timeline when component unmounts */
    return () => {
      tl.kill();
    };
  }, []);

  /** Render reviews animations container */
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ReviewsAnimations;
