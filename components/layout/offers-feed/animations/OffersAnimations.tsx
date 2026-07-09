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

  /** Setup scroll-triggered animation */
  useGSAP(() => {
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

    /** Cleanup function to kill timeline on unmount */
    return () => {
      tl.kill();
    };
  }, []);

  /** Render offers animations container */
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default OffersAnimations;
