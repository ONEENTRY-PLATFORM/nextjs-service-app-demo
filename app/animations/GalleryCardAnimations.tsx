'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * GalleryCardAnimations component to add entrance and exit animations to gallery cards.
 *
 * This component provides scroll-triggered entrance animations and page transition exit
 * animations for gallery cards using GSAP. It creates fade-in effects with staggered
 * delays based on card index, and scale/opacity transitions during page navigation.
 * @param   {object}        props           - Component properties.
 * @param   {ReactNode}     props.children  - Child elements to be animated.
 * @param   {string}        props.className - CSS classes to apply to the container.
 * @param   {number}        props.index     - Index of element in array for stagger animations.
 * @param   {CSSProperties} props.style     - Inline styles to apply to the container.
 * @returns {JSX.Element}                   JSX.Element representing the gallery card with animation capabilities.
 * @see {@link https://gsap.com/cheatsheet/|GSAP cheatsheet}
 */
const GalleryCardAnimations = ({
  children,
  className,
  index,
  style,
}: {
  children: ReactNode;
  className: string;
  index: number;
  style?: CSSProperties;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef(null);
  const [prevStage, setPrevStage] = useState('');
  const [inView, setInView] = useState<boolean>(false);
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Scroll-triggered animation timeline for gallery card entrance effect */
  useGSAP(
    () => {
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
      });
      setTriggerRef(triggerTl);

      /** Animate card from hidden to visible state */
      triggerTl.fromTo(
        ref.current,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          delay: index / 20,
          duration: 0.5,
        },
      );

      return () => {
        triggerTl.kill();
      };
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Page transition animation timeline for handling exit animations */
  useGSAP(
    () => {
      const stageTl = gsap.timeline();

      /** Execute leaving animation when page transition starts */
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
    { dependencies: [stage, readyState], scope: ref },
  );

  return (
    <div className={className} style={style} ref={ref}>
      {children}
    </div>
  );
};

export default GalleryCardAnimations;
