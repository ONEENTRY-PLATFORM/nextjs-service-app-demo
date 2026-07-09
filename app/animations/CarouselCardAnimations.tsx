'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '../store/hooks';

/**
 * Card animations with setState.
 * @param   {object}                  props           - CarouselCardAnimationsProps.
 * @param   {ReactNode}               props.children  - children ReactNode.
 * @param   {string}                  props.className - card wrapper className.
 * @param   {number}                  props.index     - index of element in array for stagger.
 * @param   {function(boolean): void} props.setState  - setState function.
 * @returns {JSX.Element}                             card with animations with GSAP.
 * @see {@link https://gsap.com/cheatsheet/ gsap cheatsheet}
 */
const CarouselCardAnimations = ({
  children,
  className,
  index,
  setState,
}: {
  children: ReactNode;
  className: string;
  index: number;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const [prevStage, setPrevStage] = useState('');
  const ref = useRef(null);
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();
  const [inView, setInView] = useState<boolean>(false);

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  useGSAP(() => {
    if (!readyState) {
      return;
    }
    const triggerTl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: ref.current,
        toggleActions: 'restart reverse restart reverse',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          setInView(self.isActive);
        },
      },
      onStart: () => {
        setState(false);
      },
      onComplete: () => {
        setState(true);
      },
      onReverseComplete: () => {
        setState(true);
      },
    });
    setTriggerRef(triggerTl);

    triggerTl.fromTo(
      ref.current,
      {
        autoAlpha: 0,
        scale: 0.8,
        yPercent: 100,
      },
      {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
        delay: index / 10,
        duration: 1,
      },
    );

    return () => {
      triggerTl.kill();
    };
  }, [readyState]);

  /**
   * Page transition animation timeline for handling exit animations
   * This creates a separate GSAP timeline that handles the card's disappearance animation
   * when navigating away from the page
   */
  useGSAP(() => {
    const stageTl = gsap.timeline();

    /**
     * Execute leaving animation when page transition starts ('leaving' stage)
     * and previous stage was 'none' (initial state)
     */
    if (stage === 'leaving' && prevStage === 'none') {
      /** First, kill the main scroll-triggered animation timeline */
      triggerRef?.kill();
      /** Only animate cards that are currently in view */
      if (inView) {
        /** Shrink the card to zero scale for exit effect */
        stageTl.to(ref.current, {
          scale: 0,
          duration: 0.65,
          delay: index / 10,
        });
      }
    }

    /** Update previous stage for comparison in next render cycle */
    setPrevStage(stage);

    /** Cleanup: destroy the timeline to prevent memory leaks */
    return () => {
      stageTl.kill();
    };
  }, [stage, readyState, triggerRef, inView]);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default CarouselCardAnimations;
