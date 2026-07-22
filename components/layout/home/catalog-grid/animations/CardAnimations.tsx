'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

const addGroupClass = (element: HTMLDivElement | null) => {
  element?.classList.add('group');
};

/**
 * CardAnimations component to add entrance and exit animations to catalog cards.
 *
 * This component uses GSAP to create complex animations for catalog cards including:
 * - Scroll-triggered entrance animations with drawing effects
 * - Staggered animations based on card index
 * - Page transition exit animations
 * - SVG circle drawing effects
 * - Text character animations
 * @param   {object}        props           - Component properties
 * @param   {ReactNode}     props.children  - Child elements to apply animations to
 * @param   {string}        props.className - CSS classes to apply to the wrapper element
 * @param   {number}        props.index     - Index of the element in array for staggered animations
 * @param   {CSSProperties} [props.style]   - Optional inline styles to apply to the wrapper element
 * @returns {JSX.Element}                   JSX.Element with animated children
 * @example
 * <CardAnimations index={0} className="card-wrapper">
 *   <CatalogCard />
 * </CardAnimations>
 * @see {@link https://gsap.com/cheatsheet/ GSAP Cheatsheet}
 */
const CardAnimations = ({
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
  /** Get current transition stage from transition state */
  const { stage } = useTransitionState();
  /** Reference to the main card element */
  const ref = useRef<HTMLDivElement>(null);
  /** Reference to the SVG circle element for animations */
  const circleRef = useRef<SVGCircleElement>(null);
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

  /**
   * Draw the Service-icon contour on scroll: the tile draws in once more than
   * a third of it is visible and undraws only after it has fully left the
   * screen, so the effect replays every time the section scrolls in and out.
   */
  useGSAP(
    () => {
      if (!readyState || !circleRef.current || !ref.current) return;

      const card = ref.current;
      const circle = circleRef.current;
      const paths = card.querySelectorAll('path');
      const title = card.querySelectorAll('.title span');
      const circleLength = Math.round(circle.getTotalLength());

      /** Reset to the undrawn state (contour hidden, icons unfilled, label off) */
      gsap.set(circle, {
        strokeDasharray: circleLength,
        strokeDashoffset: circleLength,
      });
      [...paths].forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, {
          fill: 'none',
          stroke: '#525252',
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });
      gsap.set(title, { autoAlpha: 0, xPercent: 100 });

      /**
       * Draw-in timeline driven by its own ScrollTrigger. The tile scales up from
       * its centre while the circle + icon contour draw at the same time (the
       * stroke tween is pinned to `'<'`, so it no longer waits for the scale to
       * finish), then the icons fill and the label
       * slides in. `toggleActions` replays it on every scroll: it draws in once a
       * third of the tile is visible (`start`) and reverses (undraws) only after
       * the tile has fully left the screen (`end`). Removing the old
       * `clearProps` keeps the tween reversible so the undraw actually plays.
       * `timeScale` slows the whole sequence uniformly — tune to taste.
       */
      const triggerTl = gsap.timeline({
        id: 'CatalogCardTriggerTl',
        paused: true,
        scrollTrigger: {
          trigger: card,
          start: '33% bottom',
          end: 'bottom top',
          toggleActions: 'restart reverse restart reverse',
          onToggle: (self) => setInView(self.isActive),
        },
        onComplete: () => addGroupClass(card),
      });
      triggerTl
        .fromTo(
          card,
          { autoAlpha: 0, scale: 0, transformOrigin: 'center center' },
          { autoAlpha: 1, scale: 1, duration: 0.85, delay: index / 10 },
        )
        .to(
          [circle, ...paths],
          {
            strokeDashoffset: 0,
            duration: 2.25,
            delay: index / 5,
          },
          '<',
        )
        .to(
          paths,
          { stroke: 'none', fill: '#525252', delay: -index / 10 },
          '-=0.85',
        )
        .to(
          title,
          { autoAlpha: 1, xPercent: 0, delay: -0.5, duration: 1, stagger: 0.1 },
          '-=0.45',
        );
      triggerTl.timeScale(0.5);
      setTriggerRef(triggerTl);

      /**
       * On a client-side navigation the tile mounts already inside the viewport
       * with `readyState` already true. ScrollTrigger only fires `onEnter` on a
       * scroll crossing, so a tile created in the active zone would stay stuck
       * undrawn. Play it once up front in that case; scroll toggles then take
       * over as usual.
       */
      if (triggerTl.scrollTrigger?.isActive) {
        setInView(true);
        triggerTl.play();
      }

      return () => triggerTl.kill();
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Handle stage transitions for leaving animation */
  useGSAP(
    () => {
      /** Create timeline for stage transition animations */
      const stageTl = gsap.timeline({
        id: 'CatalogCardStageTl',
        onComplete: () => addGroupClass(ref.current),
      });

      /** Play leaving animation when transitioning out */
      if (stage === 'leaving' && prevStage === 'none') {
        /** Kill trigger timeline to prevent conflicts */
        triggerRef?.kill();
        /** Animate card exit if in view and circle reference exists */
        if (inView && circleRef.current) {
          const circleLength = Math.round(circleRef.current.getTotalLength());
          stageTl
            .set(circleRef.current, {
              strokeDashoffset: 0,
              strokeDasharray: circleLength,
            })
            .to(circleRef.current, {
              strokeDashoffset: circleLength,
              duration: 0.65,
              delay: index / 10,
            })
            .to(ref.current, {
              scale: 0,
              autoAlpha: 0,
              duration: 0.5,
              delay: -0.35,
            });
        }
      }

      /** Update previous stage for transition tracking */
      setPrevStage(stage);

      /* Cleanup timeline on unmount */
      return () => stageTl.kill();
    },
    { dependencies: [stage, readyState, triggerRef, inView], scope: ref },
  );

  /** Render animated card with SVG circle decoration */
  return (
    <div className={className} style={style} ref={ref}>
      {children}
      <svg
        width="230"
        height="230"
        viewBox="0 0 230 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 z-0 h-auto max-w-full stroke-neutral-600 group-hover:stroke-fuchsia-500"
      >
        <circle ref={circleRef} cx="115" cy="115" r="114" />
      </svg>
    </div>
  );
};

export default CardAnimations;
