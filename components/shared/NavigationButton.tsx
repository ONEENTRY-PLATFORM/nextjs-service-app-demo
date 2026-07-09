import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX } from 'react';
import { useRef } from 'react';

import ArrowLeftIcon from '@/components/icons/arrow-left';
import ArrowRightIcon from '@/components/icons/arrow-right';

/**
 * Carousel navigation button component
 *
 * This component renders a navigation button for carousels with animation effects.
 * It can be either a left or right arrow button with GSAP animations.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.direction - Direction of the navigation button (left or right)
 * @returns {JSX.Element}                 Navigation button icon with animations
 */
const NavigationButton = ({
  direction,
}: {
  direction: 'left' | 'right';
}): JSX.Element => {
  /** Reference to the DOM element for GSAP animations */
  const ref = useRef<SVGSVGElement>(null);

  /** Setting up GSAP animation timeline for carousel navigation buttons */
  useGSAP(() => {
    /** Return early if ref is not available */
    if (!ref.current) {
      return;
    }

    /**
     * Create a GSAP timeline with ScrollTrigger for carousel navigation button animations
     * Timeline is paused initially and will be triggered by scroll position
     * Delay is set to 1 second to allow other animations to complete first
     */
    const tl = gsap.timeline({
      id: 'carouselTriggerTl',
      paused: true,
      scrollTrigger: {
        trigger: ref.current,
        toggleActions: 'play reverse restart reverse',
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
      },
      delay: 1,
    });

    /**
     * Animate the button from invisible (autoAlpha: 0) to visible (autoAlpha: 1)
     * autoAlpha affects both opacity and visibility for better performance
     */
    tl.fromTo(
      ref.current,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
      },
    );

    /** Cleanup function to kill the timeline when component unmounts */
    return () => {
      tl.kill();
    };
  }, []);

  /** Render left or right arrow icon based on direction prop */
  return direction === 'left' ? (
    <ArrowLeftIcon ref={ref} />
  ) : (
    <ArrowRightIcon ref={ref} />
  );
};

export default NavigationButton;
