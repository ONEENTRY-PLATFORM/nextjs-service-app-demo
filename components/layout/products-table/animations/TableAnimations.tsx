'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * TableAnimations Component
 *
 * A component that provides animated entrance and exit effects for table elements
 * using GSAP animations triggered by scroll position and page transitions.
 *
 * The component uses two animation timelines:
 * 1. Scroll-triggered animation when the table enters viewport
 * 2. Transition-triggered animation when navigating away from the page
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to be rendered within the animated container
 * @param   {string}      props.className - CSS class name for styling the container
 * @param   {object}      [props.style]   - Optional inline styles for the container
 * @param   {number}      [props.delay]   - Delay in seconds before the entrance animation starts
 * @returns {JSX.Element}                 Rendered component with animation capabilities
 * @example
 * <TableAnimations className="table-container" delay={0.2}>
 *   <table>...</table>
 * </TableAnimations>
 */
const TableAnimations = ({
  children,
  className,
  delay = 0,
  style,
}: {
  children: ReactNode;
  className: string;
  style?: object;
  delay?: number;
}): JSX.Element => {
  /** Get current transition stage from Redux store (e.g., 'entering', 'leaving', 'none') */
  const { stage } = useTransitionState();

  /** Track previous transition stage to detect stage changes */
  const [prevStage, setPrevStage] = useState<string>('');

  /** Create ref for the table container element to be used as animation target */
  const ref = useRef<HTMLDivElement>(null);

  /** Track if table section is in view for animation triggering */
  const [inView, setInView] = useState<boolean>(false);

  /** Store reference to the scroll-triggered timeline for cleanup and control */
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();

  /** Get animation ready state from Redux store to determine when animations can begin */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Setup scroll-triggered animations when readyState is true */
  useGSAP(() => {
    /** Exit early if animations are not ready to prevent premature animation */
    if (!readyState) {
      return;
    }

    /** Create scroll-triggered timeline with toggle actions for enter/exit animations */
    const triggerTl = gsap.timeline({
      id: 'tableTriggerTl',
      paused: true,
      scrollTrigger: {
        trigger: ref.current,
        toggleActions: 'restart reverse restart reverse',
        start: 'center bottom',
        end: 'bottom top',
        onToggle: (self) => {
          /** Update inView state based on scroll trigger activation status */
          setInView(self.isActive);
        },
      },
    });

    /** Store reference to the timeline for later use in cleanup or control */
    setTriggerRef(triggerTl);

    /** Define animation sequence: fade in with specified delay */
    triggerTl.fromTo(
      ref.current,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: 0.5,
        delay: delay,
      },
    );

    /** Cleanup function to kill timeline on unmount or dependency change */
    return () => {
      triggerTl.kill();
    };
  }, [readyState]);

  /** Handle animations during page transitions (navigation events) */
  useGSAP(() => {
    /** Create timeline for stage transition animations */
    const stageTl = gsap.timeline({
      paused: true,
    });

    /** Handle leaving stage animation when transitioning to a new page */
    if (stage === 'leaving' && prevStage === 'none') {
      /** Kill scroll trigger timeline to prevent conflicts during navigation */
      triggerRef?.kill();

      /** Animate table out when page is transitioning out and table is in view */
      if (inView) {
        stageTl
          .to(ref.current, {
            autoAlpha: 0,
            borderColor: 'transparent',
            duration: 0.65,
          })
          .play();
      }
    }

    /** Update previous stage state to track transition changes */
    setPrevStage(stage);

    /** Cleanup function to kill timeline on unmount or dependency change */
    return () => {
      stageTl.kill();
    };
  }, [stage, readyState, triggerRef, inView]);

  /** Render animated table container with all props applied */
  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};

export default TableAnimations;
