'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * OffersAnimations component provides scroll-triggered animations for offers section
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to be animated
 * @param   {string}      props.className - CSS class name to apply to the container
 * @returns {JSX.Element}                 Animated wrapper for offers content
 */
const OffersAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  const ref = useRef(null);

  /**
   * Setup the scroll-triggered dimming.
   *
   * The fade only makes sense in the single-row (xl) layout, where the whole
   * grid leaves the viewport as one block. On mobile/tablet the cards stack
   * into a grid several screens tall, so `top +=50` fired while the user was
   * still reading the first card and left the rest of the section stuck at
   * half opacity. `gsap.matchMedia` keeps the tween off below `xl` (1240px,
   * the project breakpoint) and reverts the inline styles when the viewport
   * crosses back down.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1240px)', () => {
        /** Create timeline with scroll trigger for offers section */
        const tl = gsap.timeline({
          paused: true,
          scrollTrigger: {
            trigger: ref.current,
            toggleActions: 'restart reverse restart reverse',
            start: 'top +=50',
            end: 'center top',
          },
        });

        /** Animate the opacity of the element when scrolled */
        tl.to(ref?.current, {
          autoAlpha: 0.5,
          duration: 1,
        });

        /** Cleanup function to kill timeline when the media query stops matching */
        return () => {
          tl.kill();
        };
      });

      /** Cleanup function to revert every media-scoped tween on unmount */
      return () => {
        mm.revert();
      };
    },
    { dependencies: [], scope: ref },
  );

  /** Render offers animations container */
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default OffersAnimations;
