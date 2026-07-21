'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

import { buildHeroScrollTimelines } from './hero/buildHeroScrollTimelines';
import { buildHeroStageTimeline } from './hero/buildHeroStageTimeline';
import HeroMask from './hero/HeroMask';
import {
  HERO_MASK_CLOSED,
  HERO_MASK_MID,
  HERO_MASK_OPEN,
} from './hero/heroMaskPaths';
import { HeroRefContext } from './hero/HeroRefContext';
import type { HeroElements, HeroRole } from './hero/heroRoles';

/**
 * HeroAnimations component for creating hero section animations.
 *
 * Drives the hero by element references collected through `useHeroRef` (no
 * `.hero-*` class lookups): a covering loader-reveal mask, a scroll parallax on
 * the background and text ({@link buildHeroScrollTimelines}), and page-transition
 * enter/leave animations ({@link buildHeroStageTimeline}).
 * @param   {object}      props           - The props for the HeroAnimations component.
 * @param   {ReactNode}   props.children  - The content to be wrapped with animations.
 * @param   {string}      props.className - The class name to be applied to the container.
 * @returns {JSX.Element}                 The JSX element for the hero section animations.
 */
const HeroAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );
  const [backTl, setBackTl] = useState<gsap.core.Timeline>();
  const [triggerTl, setTriggerTl] = useState<gsap.core.Timeline>();
  const [prevStage, setPrevStage] = useState<string>('');
  /**
   * Once this hero enters the `leaving` stage it is on its way out (the route
   * is unmounting it). While it lingers in the DOM the transition can flip to
   * `entering`, which would re-run the reveal and snap the covering overlay
   * back open. This latch keeps the overlay covering until unmount.
   */
  const hasLeftRef = useRef(false);

  /**
   * Hero element references keyed by role, populated by the `useHeroRef`
   * callback refs during commit (before the GSAP layout effects run).
   */
  const els = useRef<HeroElements>({
    bg: null,
    kicker: null,
    title: null,
    description: null,
    button: null,
  });
  /** Stable ref-registration factory handed to the context consumers. */
  const register = useCallback(
    (role: HeroRole) => (el: Element | null) => {
      els.current[role] = el;
    },
    [],
  );

  /** Scroll parallax — built once, scrubbed by its own ScrollTriggers */
  useGSAP(
    () => {
      if (!ref.current) {
        return;
      }

      const { bgTl, triggerTl } = buildHeroScrollTimelines({
        trigger: ref.current,
        elements: els.current,
      });
      setBackTl(bgTl);
      setTriggerTl(triggerTl);

      return () => {
        triggerTl.kill();
        bgTl.kill();
      };
    },
    { dependencies: [], scope: ref },
  );

  /** Page-transition reveal / leave, plus the mask wave that frames it */
  useGSAP(() => {
    if (!ref.current || !readyState) {
      return;
    }

    const heroMask = ref.current.querySelectorAll('#hero_mask path');

    /**
     * Already leaving — this hero only unmounts from here. `useGSAP` reverts
     * the previous (covering) context on every re-run, which snaps the mask
     * back open; re-apply the fully-covering path so the overlay stays closed
     * until unmount instead of flashing the header.
     */
    if (hasLeftRef.current) {
      gsap.set(heroMask, { attr: { d: HERO_MASK_CLOSED } });
      return;
    }

    const leaving = stage === 'leaving' && prevStage === 'none';
    /**
     * First paint and a route change reveal the hero identically — the wave
     * opens either way; only the trigger differs.
     */
    const revealing =
      (stage === 'none' && prevStage === '') ||
      (stage === 'entering' && prevStage === 'leaving');

    const stageTl = buildHeroStageTimeline({
      elements: els.current,
      leaving,
    });

    /** The mask wave; the hero's own reveal starts when it finishes */
    const loaderTl = gsap.timeline({
      id: 'heroLoaderTl',
      paused: true,
      onComplete: () => {
        stageTl.play();
      },
    });

    if (revealing) {
      loaderTl
        .to(heroMask, {
          duration: 0.65,
          attr: { d: HERO_MASK_MID },
          ease: 'power2.in',
        })
        .to(heroMask, {
          duration: 0.65,
          attr: { d: HERO_MASK_OPEN },
          ease: 'power2.out',
        })
        .play();
    } else if (leaving) {
      /** Latch: from here on this hero only unmounts — never reveal again */
      hasLeftRef.current = true;
      stageTl.play();
      backTl?.kill();
      triggerTl?.kill();

      if (els.current.bg) {
        stageTl.to([els.current.bg, '.bg-gradient-1'], {
          autoAlpha: 0,
          duration: 0.65,
        });
      }
      /**
       * Cover the header and hold it closed. Play the wave forward from the
       * open state to fully covering and stop there — the overlay must stay
       * closed as the page leaves, not reveal the header again.
       */
      loaderTl
        .set(heroMask, { attr: { d: HERO_MASK_OPEN } })
        .to(heroMask, {
          attr: { d: HERO_MASK_MID },
          duration: 0.5,
          ease: 'power2.in',
        })
        .to(heroMask, {
          attr: { d: HERO_MASK_CLOSED },
          duration: 0.5,
          ease: 'power2.out',
        })
        .play();
    }

    setPrevStage(stage);

    return () => {
      stageTl.kill();
      loaderTl.kill();
    };
  }, [stage, readyState]);

  return (
    <div ref={ref} className={className}>
      <HeroMask />
      <HeroRefContext.Provider value={register}>
        {children}
      </HeroRefContext.Provider>
    </div>
  );
};

export default HeroAnimations;
