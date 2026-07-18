'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * GridItemAnimations — entrance/exit wrapper for a single item of a responsive
 * card/photo grid (service cards, gallery tiles, review cards, master cards,
 * portfolio cells). It is tuned for long, dense grids rather than the small
 * home-page rows the global `CardAnimations` targets:
 *
 * 1. Scroll-triggered entrance — each item fades, scales and slides up as it
 *    enters the viewport. The stagger is per-column (`index % columns`) rather
 *    than cumulative on `index`, so items deep in the list still appear promptly
 *    instead of waiting out an ever-growing delay.
 * 2. Page-transition exit — on the `next-transition-router` `leaving` stage the
 *    visible items fade and scale away.
 *
 * When the grid re-mounts on a filter change the same entrance replays, reading
 * as an intentional reveal of the new results. Pair it with a parent-level
 * `ScrollTrigger.refresh()` on the filtered list so items that stay in view
 * across the height change also re-fire (see the services catalog).
 * @param   {object}        props             - Component properties
 * @param   {ReactNode}     props.children    - The grid item to animate
 * @param   {string}        [props.className] - CSS classes for the wrapper element
 * @param   {number}        props.index       - Item index in the grid, for the column stagger
 * @param   {number}        [props.columns]   - Column count driving the stagger (default 2)
 * @param   {CSSProperties} [props.style]     - Optional inline styles for the wrapper
 * @returns {JSX.Element}                     Animated wrapper around the grid item
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const GridItemAnimations = ({
  children,
  className,
  index,
  columns = 2,
  style,
}: {
  children: ReactNode;
  className?: string | undefined;
  index: number;
  columns?: number | undefined;
  style?: CSSProperties | undefined;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const [prevStage, setPrevStage] = useState('');
  const [inView, setInView] = useState<boolean>(false);
  const [triggerTl, setTriggerTl] = useState<gsap.core.Timeline>();

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Column-based stagger so the items of a row lead in slightly offset */
  const stagger = (index % columns) * 0.07;

  /** Scroll-triggered entrance timeline */
  useGSAP(
    () => {
      if (!ref.current || !readyState) {
        return;
      }
      const triggerTl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: ref.current,
          toggleActions: 'restart reverse restart reverse',
          start: 'top 92%',
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
          scale: 0.9,
          y: 32,
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          delay: stagger,
          ease: 'power2.out',
        },
      );

      /**
       * The item mounts already inside the viewport whenever the grid filter
       * changes (or on a client-side navigation to the page). ScrollTrigger only
       * fires `onEnter` on an actual scroll crossing, so an item created in the
       * active zone would stay stuck at its hidden `fromTo` start. Play it once
       * up front in that case; scroll toggles then take over as usual.
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
            scale: 0.85,
            y: 20,
            duration: 0.5,
            delay: stagger,
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
    <div className={className} style={style} ref={ref}>
      {children}
    </div>
  );
};

export default GridItemAnimations;
