'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * CardAnimations component to add entrance, loading, and exit animations to cards.
 *
 * This component provides three types of animations for card elements using GSAP:
 * 1. Scroll-triggered entrance animations with scale and fade effects
 * 2. Loading animations with yoyo effect for skeleton loaders
 * 3. Page transition exit animations with scale and fade effects
 *
 * The animations are staggered based on the index property to create a cascading effect.
 * The component integrates with Redux for animation readiness state and with
 * next-transition-router for page transition animations.
 * @param   {object}        props           - Component properties.
 * @param   {ReactNode}     props.children  - Child elements to be animated.
 * @param   {string}        props.className - CSS classes to apply to the container.
 * @param   {number}        props.index     - Index of element in array for stagger animations.
 * @param   {CSSProperties} props.style     - Inline styles to apply to the container.
 * @param   {boolean}       props.loader    - Flag to enable loading animations instead of scroll-triggered animations.
 * @returns {JSX.Element}                   JSX.Element representing the card with animation capabilities.
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const CardAnimations = ({
  children,
  className,
  index,
  style,
  loader,
}: {
  children: ReactNode;
  className: string;
  index: number;
  style?: CSSProperties;
  loader?: boolean;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef(null);
  const [prevStage, setPrevStage] = useState('');
  const [inView, setInView] = useState<boolean>(false);
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Animation timeline for scroll-triggered card entrance effect */
  useGSAP(
    () => {
      if (!readyState || loader) {
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
      });
      setTriggerRef(triggerTl);

      triggerTl.fromTo(
        ref.current,
        {
          autoAlpha: 0,
          scale: 0.5,
          translateY: '50%',
        },
        {
          autoAlpha: 1,
          scale: 1,
          translateY: 0,
          delay: index / 20,
          duration: 0.5,
        },
      );

      /**
       * On a client-side navigation the card mounts already inside the viewport
       * with `readyState` already true. ScrollTrigger only fires `onEnter` on a
       * scroll crossing, so a card created in the active zone would stay stuck
       * at its hidden `fromTo` start. Play it once up front in that case; scroll
       * toggles then take over as usual.
       */
      if (triggerTl.scrollTrigger?.isActive) {
        setInView(true);
        triggerTl.play();
      }

      return () => {
        triggerTl.kill();
      };
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Loading animation timeline for cards displayed during loading state */
  useGSAP(
    () => {
      if (!readyState || !loader) {
        return;
      }
      const loaderTl = gsap.timeline({
        repeat: -1,
        yoyo: true,
        repeatDelay: 2.5,
      });

      loaderTl.fromTo(
        ref.current,
        {
          autoAlpha: 0,
          scale: 0.5,
          translateY: '50%',
        },
        {
          autoAlpha: 1,
          scale: 1,
          translateY: 0,
          delay: index / 20,
          duration: 0.5,
        },
      );

      return () => {
        loaderTl.kill();
      };
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Page transition animation timeline for handling exit animations */
  useGSAP(
    () => {
      const stageTl = gsap.timeline();

      /** stage leaving */
      if (stage === 'leaving' && prevStage === 'none') {
        triggerRef?.kill();
        if (inView) {
          stageTl.to(ref.current, {
            scale: 0,
            autoAlpha: 0,
            duration: 0.65,
            delay: index / 20,
            ease: 'power1.inOut',
          });
        }
      }

      setPrevStage(stage);

      return () => {
        stageTl.kill();
      };
    },
    { dependencies: [stage, readyState, triggerRef, inView], scope: ref },
  );

  return (
    <div className={className} style={style} ref={ref}>
      {children}
    </div>
  );
};

export default CardAnimations;
