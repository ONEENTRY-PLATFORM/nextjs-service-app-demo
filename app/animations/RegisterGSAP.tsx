'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import type { JSX } from 'react';

import { useIsomorphicLayoutEffect } from './utils/useIsomorphicLayoutEffect';

/**
 * Component that registers GSAP plugins and custom animation effects
 *
 * This component is responsible for registering all necessary GSAP plugins
 * and defining custom animation effects that can be used throughout the application.
 * It should be placed at the root level of the application to ensure plugins are available for all animations.
 * @returns {JSX.Element} An empty JSX element
 */
const RegisterGSAP = (): JSX.Element => {
  useIsomorphicLayoutEffect(() => {
    /**
     * ScrollToPlugin is deliberately NOT registered here — it is only needed
     * for route transitions and is loaded on demand by `scrollToTop`.
     */
    gsap.registerPlugin(useGSAP, ScrollTrigger);

    gsap.config({
      autoSleep: 120,
      force3D: true,
      nullTargetWarn: false,
    });

    /**
     * Card animation effect with scroll-based scrubbing
     *
     * This effect creates a timeline animation for cards that responds to scroll position.
     * The animation includes fade-in, scale, and vertical movement effects.
     */
    gsap.registerEffect({
      name: 'cardAnimations',
      effect: (
        target: gsap.TweenTarget | HTMLDivElement,
        config: { duration: number; delay: number; scrub: number | boolean },
      ) => {
        const tl = gsap.timeline({
          paused: true,
          autoRemoveChildren: true,
          scrollTrigger: {
            trigger: target as HTMLDivElement,
            scrub: config.scrub,
            toggleActions: 'restart reverse restart reverse',
            start: 'top bottom',
            end: 'center bottom',
          },
        });

        return tl.fromTo(
          target,
          {
            autoAlpha: 0,
            scale: 0.8,
            yPercent: 100,
          },
          {
            autoAlpha: 1,
            scale: 1,
            yPercent: 0,
            delay: config.delay,
            duration: config.duration,
          },
        );
      },
      defaults: { duration: 2, delay: 0, scrub: 4 },
      extendTimeline: true,
    });
    // Now we can use it like this
    // gsap.effects.cardAnimations('.box', { duration: 3 });
    // Or directly on timelines
    // tl.fade('.box', { duration: 3 });

    /**
     * Slide up animation effect
     *
     * This effect creates a slide-up animation with fade-in transition.
     * The element moves from below the viewport to its final position while fading in.
     * @example
     * ```javascript
     * // Using the effect
     * gsap.effects.slideUp('.element', { duration: 0.5, delay: 0 });
     * ```
     */
    gsap.registerEffect({
      name: 'slideUp',
      effect: (
        target: gsap.TweenTarget | HTMLDivElement,
        config: { duration: number; delay: number },
      ) => {
        const tl = gsap.timeline({
          paused: true,
        });

        return tl.fromTo(
          target,
          {
            autoAlpha: 0,
            yPercent: 100,
          },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: config.duration,
            delay: config.delay,
          },
        );
      },
      defaults: { duration: 0.5, delay: 0 },
      extendTimeline: true,
    });

    /**
     * Fade in animation effect
     *
     * This effect creates a simple fade-in animation for elements.
     * The element transitions from completely transparent to fully visible.
     * @example
     * ```javascript
     * // Using the effect
     * gsap.effects.fadeIn('.element', { duration: 0.5, delay: 0 });
     * ```
     */
    gsap.registerEffect({
      name: 'fadeIn',
      effect: (
        target: gsap.TweenTarget | HTMLDivElement,
        config: { duration: number; delay: number },
      ) => {
        const tl = gsap.timeline();

        return tl
          .set(target, {
            autoAlpha: 0,
          })
          .to(target, {
            autoAlpha: 1,
            duration: config.duration,
            delay: config.delay,
          });
      },
      defaults: { duration: 0.5, delay: 0 },
      extendTimeline: true,
    });
  }, []);

  return <></>;
};

export default RegisterGSAP;
