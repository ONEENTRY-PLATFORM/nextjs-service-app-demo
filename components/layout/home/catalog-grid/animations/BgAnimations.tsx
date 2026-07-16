'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * BgAnimations component to add background animations to the catalog section.
 *
 * This component uses GSAP to create complex background animations including:
 * - Scroll-triggered parallax effects for background text elements
 * - Page transition animations for entrance and exit
 * - Staggered character animations for "BEAUTY" and "SALON" text
 * - Smooth transitions between different page states
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to apply animations to
 * @param   {string}      props.className - CSS classes to apply to the wrapper element
 * @returns {JSX.Element}                 JSX.Element with animated background elements
 */
const BgAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Get current transition stage from transition state */
  const { stage } = useTransitionState();
  /** Reference to the main background element */
  const ref = useRef<HTMLDivElement>(null);

  /** State to track previous transition stage */
  const [prevStage, setPrevStage] = useState<string>('');
  /** State to track if element is in view for scroll animations */
  const [inView, setInView] = useState<boolean>(false);
  /** State to track active transitions */
  const [transition, setTransition] = useState<boolean>(false);
  /** Reference to store the scroll-triggered animation timeline */
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();

  /** Get animation ready state from Redux store */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Initialize scroll-triggered background animation timeline */
  useGSAP(
    () => {
      /** Skip initialization if not ready or transition is active */
      if (!readyState || transition) {
        return;
      }
      /** Create timeline for scroll-triggered background animations */
      const triggerTl = gsap.timeline({
        id: 'bgTriggerTl',
        paused: true,
        scrollTrigger: {
          trigger: ref.current,
          scrub: 4,
          toggleActions: 'restart reverse restart reverse',
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            setInView(self.isActive);
          },
        },
      });
      /** Store timeline reference for later use */
      setTriggerRef(triggerTl);

      /** Configure background text entrance animations */
      triggerTl
        .fromTo(
          '#beauty_bg',
          {
            autoAlpha: 0.5,
            x: 400,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 3,
          },
        )
        .fromTo(
          '#salon_bg',
          {
            autoAlpha: 0.5,
            x: -400,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 5,
            stagger: 0.1,
          },
          '-=2.5',
        );

      /** Cleanup timeline on unmount */
      return () => {
        triggerTl.kill();
      };
    },
    { dependencies: [readyState, transition], scope: ref },
  );

  /** Handle stage transitions for background animations */
  useGSAP(
    () => {
      /** Create timeline for stage transition animations */
      const stageTl = gsap.timeline({
        id: 'bgStageTl',
        paused: true,
      });

      /** Play initial entrance animation when component is ready */
      if (stage === 'none' && prevStage === '' && readyState) {
        /** Animate background text elements on initial load */
        stageTl
          .fromTo(
            '#beauty_bg span',
            {
              autoAlpha: 0.5,
              yPercent: 50,
            },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 3,
              stagger: 0.15,
            },
          )
          .fromTo(
            '#salon_bg span',
            {
              autoAlpha: 0.5,
              yPercent: 50,
            },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 3.5,
              delay: 0.25,
              stagger: 0.1,
            },
            '<',
          )
          .play();
      }
      // enter stage
      else if (stage === 'entering' && prevStage === 'leaving' && readyState) {
        /** Animate background text elements on page enter */
        stageTl
          .fromTo(
            '#beauty_bg span',
            {
              autoAlpha: 0.5,
              yPercent: 50,
            },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 3,
              stagger: 0.15,
            },
          )
          .fromTo(
            '#salon_bg span',
            {
              autoAlpha: 0.5,
              yPercent: 50,
            },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 3.5,
              delay: 0.25,
              stagger: 0.1,
            },
            '<',
          )
          .play();
      } else if (stage === 'leaving' && prevStage === 'none') {
        /** Set transition state and kill trigger timeline */
        setTransition(true);
        triggerRef?.kill();
        /** Animate background exit when transitioning out */
        if (inView) {
          stageTl
            .to('#beauty_bg', {
              autoAlpha: 0,
              x: -1500,
              duration: 1,
              ease: 'power2.out',
            })
            .to('#salon_bg', {
              autoAlpha: 0,
              x: 1500,
              duration: 0.85,
              delay: -0.95,
              ease: 'power2.out',
            })
            .to('#beauty_bg span', {
              autoAlpha: 0,
              yPercent: 50,
              duration: 0.35,
              stagger: 0.15,
            })
            .to(
              '#salon_bg span',
              {
                autoAlpha: 0,
                yPercent: 70,
                duration: 0.35,
                delay: 0.15,
                stagger: 0.1,
              },
              '<',
            )
            .play();
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

  /** Render background animations container with children */
  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default BgAnimations;
