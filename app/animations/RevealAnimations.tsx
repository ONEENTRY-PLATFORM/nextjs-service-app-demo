'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * RevealAnimations — a generic section-reveal wrapper. It combines the two
 * animation kinds a page section usually needs:
 *
 * 1. Scroll-triggered entrance ("in") — the block fades (and, unless
 *    `fade` is set, slides up by `distance`) as it enters the viewport, and
 *    reverses once it has scrolled fully past the top.
 * 2. Page-transition exit ("out") — on the `next-transition-router` `leaving`
 *    stage the block fades (and slides) away.
 *
 * The `fade` mode animates opacity only, leaving `transform` untouched — use it
 * for blocks that contain `position: fixed`/`absolute` descendants (e.g. a
 * dropdown, an embedded map iframe), where a lingering wrapper transform would
 * otherwise become their containing block and mis-position them.
 * @param   {object}        props             - Component properties
 * @param   {ReactNode}     props.children    - Content to reveal
 * @param   {string}        [props.className] - CSS classes for the wrapper element
 * @param   {CSSProperties} [props.style]     - Optional inline styles for the wrapper
 * @param   {number}        [props.delay]     - Entrance delay in seconds
 * @param   {number}        [props.distance]  - Slide distance in px (ignored when `fade`)
 * @param   {boolean}       [props.fade]      - Opacity-only mode, no transform
 * @returns {JSX.Element}                     Animated wrapper around the section
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const RevealAnimations = ({
  children,
  className,
  style,
  delay = 0,
  distance = 40,
  fade = false,
}: {
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  delay?: number | undefined;
  distance?: number | undefined;
  fade?: boolean | undefined;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const [prevStage, setPrevStage] = useState('');
  const [inView, setInView] = useState<boolean>(false);
  const [triggerTl, setTriggerTl] = useState<gsap.core.Timeline>();

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Scroll-triggered entrance timeline */
  useGSAP(
    () => {
      if (!ref.current || !readyState) {
        return;
      }
      const triggerTl = gsap.timeline({
        paused: true,
        delay,
        scrollTrigger: {
          trigger: ref.current,
          toggleActions: 'restart reverse restart reverse',
          start: 'top 88%',
          end: 'bottom top',
          onToggle: (self) => {
            setInView(self.isActive);
          },
        },
      });
      setTriggerTl(triggerTl);

      triggerTl.fromTo(
        ref.current,
        {
          autoAlpha: 0,
          ...(fade ? {} : { y: distance }),
        },
        {
          autoAlpha: 1,
          ...(fade ? {} : { y: 0 }),
          duration: 0.7,
          ease: 'power2.out',
        },
      );

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

      return () => {
        triggerTl.kill();
      };
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Page-transition exit timeline */
  useGSAP(
    () => {
      const stageTl = gsap.timeline();

      if (stage === 'leaving' && prevStage === 'none') {
        triggerTl?.kill();
        if (inView) {
          stageTl.to(ref.current, {
            autoAlpha: 0,
            ...(fade ? {} : { y: distance / 2 }),
            duration: 0.5,
            ease: 'power1.inOut',
          });
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
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default RevealAnimations;
