'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * BannerAnimations component that provides animation effects for page banners
 *
 * This component handles both scroll-triggered animations and page transition animations
 * for banner content using GSAP. It creates a fade-in effect when the banner enters the
 * viewport during scrolling, and handles exit animations during page transitions.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to be wrapped by this component (the banner content)
 * @param   {string}      props.className - CSS class name to apply to the container element
 * @returns {JSX.Element}                 Returns a JSX element with animation effects applied
 */
const BannerAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Get current transition stage from next-transition-router (none, ready, leaving, entered) */
  const { stage } = useTransitionState();
  /** Create a reference to the banner container div element for DOM manipulation */
  const ref = useRef<HTMLDivElement>(null);
  /** Track the previous transition stage to detect stage changes */
  const [prevStage, setPrevStage] = useState<string>('');
  /** Track whether the banner is currently in the viewport for animation control */
  const [inView, setInView] = useState<boolean>(false);
  /** Store reference to the scroll-triggered GSAP timeline for cleanup and control */
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();
  /** Get animation ready state from Redux store to synchronize animations */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Set up scroll-triggered animations using GSAP */
  useGSAP(
    () => {
      /** Exit early if ref is not attached */
      if (!ref.current) return;

      /** Select the banner title element by ID for individual animation */
      const title = ref.current.querySelector('#baner_title');
      /** Select the banner image element by ID for individual animation */
      const image = ref.current.querySelector('#baner_image');
      /** Select the banner link element by ID for individual animation */
      const link = ref.current.querySelector('#baner_link');
      /** Select the banner description element by ID for individual animation */
      const descr = ref.current.querySelector('#baner_descr');
      /** Select the banner phone element by ID for individual animation */
      const phone = ref.current.querySelector('#baner_phone');

      /** Create a GSAP timeline with scroll triggering capabilities */
      const triggerTl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: ref.current,
          toggleActions: 'restart reverse restart reverse',
          start: 'center bottom',
          end: 'bottom top',
          onToggle: (self) => {
            /** Update inView state when the scroll trigger activates/deactivates */
            setInView(self.isActive);
          },
        },
      });

      /** Store the timeline reference for later access and cleanup */
      setTriggerRef(triggerTl);

      /**
       * Define the complete animation sequence for the banner:
       * 1. Container fades in and moves up from below
       * 2. Image fades in (with overlapping timing via negative delay)
       * 3. Title, link, description and phone fade in sequentially with stagger
       */
      triggerTl
        .fromTo(
          ref.current,
          {
            autoAlpha: 0,
            yPercent: 50,
          },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.5,
          },
        )
        .fromTo(
          image,
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 0.5,
            delay: -0.25, // Overlap with previous animation
          },
        )
        .fromTo(
          [title, link, descr, phone],
          {
            autoAlpha: 0,
            yPercent: 100,
          },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.5,
            stagger: 0.25, // Sequential animation with 0.25s delay between elements
            delay: -0.25, // Start before previous animation completes
          },
        );

      /** Cleanup function that kills the timeline to prevent memory leaks */
      return () => {
        triggerTl.kill();
      };
    },
    { scope: ref },
  );

  /** Handle animations during page transitions (route changes) */
  useGSAP(() => {
    /** Create a timeline for handling page transition animations */
    const stageTl = gsap.timeline();

    /** Handle the 'leaving' stage when navigating away from the page */
    if (stage === 'leaving' && prevStage === 'none') {
      // Stop the scroll-triggered animation
      triggerRef?.kill();
      // If the banner is in view, animate it out with fade effect
      if (inView) {
        stageTl.to(ref.current, {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power1.inOut',
        });
      }
    }

    /** Update the previous stage tracking state */
    setPrevStage(stage);

    /** Cleanup function that kills the timeline to prevent memory leaks */
    return () => {
      stageTl.kill();
    };
  }, [stage, readyState, triggerRef, inView]);

  /** Render the animated banner container with ref and className */
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default BannerAnimations;
