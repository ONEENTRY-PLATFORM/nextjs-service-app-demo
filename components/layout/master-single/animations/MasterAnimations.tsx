'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * MasterAnimations component to add entrance and exit animations to master page elements.
 *
 * This component uses GSAP to create scroll-triggered animations for master page elements.
 * It handles both initial page load animations and page transition animations when navigating away.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to apply animations to
 * @param   {string}      props.className - CSS classes to apply to the wrapper element
 * @returns {JSX.Element}                 JSX.Element with animated children
 * @see {@link https://gsap.com/cheatsheet/ gsap cheatsheet}
 */
const MasterAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Get current transition stage from Redux store */
  const { stage } = useTransitionState();
  /** Track previous transition stage to detect changes */
  const [prevStage, setPrevStage] = useState('');
  /** Create ref for the master container element */
  const ref = useRef<HTMLDivElement>(null);
  /** Track if master section is in view for animation triggering */
  const [inView, setInView] = useState<boolean>(false);
  /** Store reference to the scroll-triggered timeline */
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();

  /** Get animation ready state from Redux store */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Setup scroll-triggered animations when readyState is true */
  useGSAP(() => {
    /** Exit early if animations are not ready */
    if (!readyState) {
      return;
    }
    /** Get all items with 'item' class for animation */
    const items = ref.current?.querySelectorAll('.item') || [];

    /** Create scroll-triggered timeline with toggle actions */
    const triggerTl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: ref.current,
        toggleActions: 'restart reverse restart reverse',
        start: 'top bottom',
        end: '+=120% top',
        onToggle: (self) => {
          /** Update inView state based on scroll trigger activation */
          setInView(self.isActive);
        },
      },
    });
    /** Store reference to the timeline for later use */
    setTriggerRef(triggerTl);

    /** Define animation sequence: fade in items with stagger */
    triggerTl.fromTo(
      items,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: 0.35,
        stagger: 0.05,
      },
    );

    /** Cleanup function to kill timeline on unmount */
    return () => {
      triggerTl.kill();
    };
  }, [readyState]);

  /** Handle animations during page transitions */
  useGSAP(() => {
    /** Get all items with 'item' class for animation */
    const items = ref.current?.querySelectorAll('.item') || [];

    /** Create timeline for stage transition animations */
    const stageTl = gsap.timeline({
      paused: true,
    });

    /** leaving stage */
    if (stage === 'leaving' && prevStage === 'none') {
      /** Kill scroll trigger timeline */
      triggerRef?.kill();
      /** Animate items out when page is transitioning out */
      if (inView) {
        stageTl
          .to([...items]?.reverse(), {
            autoAlpha: 0,
            yPercent: 50,
            duration: 0.35,
            stagger: 0.05,
            ease: 'power1.inOut',
          })
          .play();
      }
    }

    /** Update previous stage state */
    setPrevStage(stage);

    /** Cleanup function to kill timeline on unmount */
    return () => {
      stageTl.kill();
    };
  }, [stage, readyState, triggerRef, inView]);

  /** Render animated master container */
  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default MasterAnimations;
