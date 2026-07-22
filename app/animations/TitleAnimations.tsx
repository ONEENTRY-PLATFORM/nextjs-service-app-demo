'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '../store/hooks';

/**
 * Title animations component.
 *
 * This component provides entrance and exit animations for title elements using GSAP.
 * It animates both the title text and associated horizontal rule (hr) element with
 * scroll-triggered and transition-based animations.
 *
 * The component uses two types of animations:
 * 1. Scroll-triggered entrance animations that play when the element enters the viewport
 * 2. Page transition exit animations that play when navigating to a new page
 *
 * It integrates with Redux for animation readiness state and with next-transition-router
 * for page transition animations. The component handles both the title text and
 * horizontal rule elements with coordinated animations.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to be animated (typically title text and hr element)
 * @param   {string}      props.className - CSS classes to apply to the container
 * @param   {number}      props.delay     - Delay before starting the animation (in seconds)
 * @returns {JSX.Element}                 JSX.Element with animated title and hr elements
 * @example
 * ```tsx
 * <TitleAnimations className="title-container" delay={0.5}>
 *   <h1 className="title">Page Title</h1>
 *   <hr />
 * </TitleAnimations>
 * ```
 */
const TitleAnimations = ({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  const [transition, setTransition] = useState<boolean>(false);
  const [triggerTl, setTriggerTl] = useState<gsap.core.Timeline>();
  const [prevStage, setPrevStage] = useState('');
  const [inView, setInView] = useState(false);

  /** triggerTl */
  useGSAP(
    () => {
      if (!ref.current || !readyState) {
        return;
      }
      const title = ref.current?.querySelector('.title');
      const hr = ref.current?.querySelector('hr');

      const triggerTl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: ref.current,
          toggleActions: 'restart reverse restart reverse',
          start: 'top 80%',
          end: 'bottom top',
          onToggle: (self) => {
            setInView(self.isActive);
          },
        },
        delay: delay,
      });
      setTriggerTl(triggerTl);

      if (title) {
        triggerTl.fromTo(
          title,
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 1,
          },
        );
      }
      if (hr) {
        triggerTl.fromTo(
          hr,
          {
            autoAlpha: 0.5,
            width: '0%',
          },
          {
            autoAlpha: 1,
            width: '100%',
            duration: 1.25,
            transformOrigin: 'center center',
          },
          '-=0.5',
        );
      }

      /**
       * On a client-side navigation the heading mounts already inside the
       * viewport with `readyState` already true. ScrollTrigger only fires
       * `onEnter` on a scroll crossing, so a heading created in the active zone
       * would stay stuck at its hidden `fromTo` start. Play it once up front in
       * that case; scroll toggles then take over as usual.
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

  /** stageTl */
  useGSAP(
    () => {
      if (!readyState || transition) {
        return;
      }
      const title = ref.current?.querySelector('.title');
      const hr = ref.current?.querySelector('hr');

      const stageTl = gsap.timeline({
        paused: true,
      });

      /** leaving stage */
      if (stage === 'leaving' && prevStage === 'none') {
        triggerTl?.kill();
        setTransition(true);
        if (title) {
          stageTl.fromTo(
            title,
            {
              autoAlpha: 0,
            },
            {
              autoAlpha: 1,
              duration: 0.65,
              ease: 'power2.inOut',
            },
          );
        }
        if (hr) {
          stageTl.fromTo(
            hr,
            {
              autoAlpha: 0.25,
              width: '0%',
            },
            {
              autoAlpha: 1,
              width: '100%',
              duration: 0.75,
              transformOrigin: 'center center',
              ease: 'power2.inOut',
            },
            '-=0.35',
          );
        }
        if (inView) {
          stageTl.reverse(1);
        }
      }

      setPrevStage(stage);

      return () => {
        stageTl.kill();
      };
    },
    { dependencies: [stage, readyState, triggerTl, inView], scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default TitleAnimations;
