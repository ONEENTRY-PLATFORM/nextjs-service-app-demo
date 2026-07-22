'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * ReviewsAnimations component adds entrance and exit animations to the reviews
 * carousel.
 *
 * The carousel is animated as a single unit rather than per slide: only one
 * review is ever mounted and it is re-created on every change (its own
 * `review-fade` CSS keyframes handle that), so a timeline bound to the slide
 * node would be left pointing at a detached element after the first switch.
 * Two timelines drive the section:
 * 1. `triggerTl` — the block rises and fades in once it scrolls into view and
 * reverses back out when it leaves, replaying on every pass
 * (`toggleActions`); the side arrows fade in after it, staggered.
 * 2. `stageTl` — the block fades away when navigating to another page, but only
 * while it is actually on screen.
 * @param   {object}      props           - Component properties.
 * @param   {ReactNode}   props.children  - Child components to apply animations to.
 * @param   {string}      props.className - CSS class name to apply to the wrapper element.
 * @returns {JSX.Element}                 Wrapper component with animation functionality.
 */
const ReviewsAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Get current transition stage from transition state */
  const { stage } = useTransitionState();
  /** Create ref for the reviews container element */
  const ref = useRef<HTMLDivElement>(null);
  /** State to track previous transition stage */
  const [prevStage, setPrevStage] = useState('');
  /** State to track if element is in view */
  const [inView, setInView] = useState<boolean>(false);
  /** State to store reference to trigger timeline */
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();

  /** Get animation ready state from Redux store */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Scroll-triggered entrance timeline, reversed when the block scrolls away */
  useGSAP(
    () => {
      if (!ref.current || !readyState) {
        return;
      }

      /** Side arrows — faded in after the block itself */
      const arrows = ref.current.querySelectorAll('.arrow');

      const triggerTl = gsap.timeline({
        id: 'reviewsTriggerTl',
        paused: true,
        scrollTrigger: {
          trigger: ref.current,
          toggleActions: 'restart reverse restart reverse',
          start: 'top 85%',
          end: 'bottom top',
          onToggle: (self) => {
            setInView(self.isActive);
          },
        },
      });
      setTriggerRef(triggerTl);

      triggerTl.fromTo(
        ref.current,
        {
          autoAlpha: 0,
          yPercent: 8,
        },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.75,
          ease: 'power2.out',
        },
      );

      if (arrows.length) {
        triggerTl.fromTo(
          arrows,
          {
            autoAlpha: 0,
            scale: 0.6,
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.15,
          },
          '-=0.35',
        );
      }

      /**
       * On a client-side navigation the block mounts already inside the viewport
       * with `readyState` already true. ScrollTrigger only fires `onEnter` on a
       * scroll crossing, so a block created in the active zone would stay stuck
       * at its hidden `fromTo` start. Play it once up front in that case; scroll
       * toggles then take over as usual.
       */
      if (triggerTl.scrollTrigger?.isActive) {
        setInView(true);
        triggerTl.play();
      }

      /** Clean up timeline when component unmounts */
      return () => {
        triggerTl.kill();
      };
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Page transition exit timeline */
  useGSAP(
    () => {
      const stageTl = gsap.timeline({ id: 'reviewsStageTl' });

      /** Play the leaving animation when navigating away from this page */
      if (stage === 'leaving' && prevStage === 'none') {
        /** Kill trigger timeline to prevent conflicts */
        triggerRef?.kill();
        if (inView) {
          stageTl.to(ref.current, {
            autoAlpha: 0,
            yPercent: -6,
            duration: 0.6,
            ease: 'power2.inOut',
          });
        }
      }

      /** Update previous stage for transition tracking */
      setPrevStage(stage);

      /** Cleanup timeline on unmount */
      return () => {
        stageTl.kill();
      };
    },
    { dependencies: [stage, readyState, triggerRef, inView], scope: ref },
  );

  /** Render reviews animations container */
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ReviewsAnimations;
