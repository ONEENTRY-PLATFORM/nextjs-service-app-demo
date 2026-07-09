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

  /** Initialize scroll-triggered animation timeline */
  useGSAP(() => {
    if (!readyState || !circleRef.current) return;

    /** Create timeline for scroll-triggered animations */
    const triggerTl = gsap.timeline({
      id: 'CatalogCardTriggerTl',
      paused: true,
      scrollTrigger: {
        trigger: ref.current,
        toggleActions: 'restart reverse restart reverse',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => setInView(self.isActive),
      },
      onComplete: () => addGroupClass(ref.current),
      onReverseComplete: () => addGroupClass(ref.current),
    });

    /** Store timeline reference for later use */
    setTriggerRef(triggerTl);

    /** Get SVG path elements for animation */
    const paths = ref.current?.querySelectorAll('path') || [];
    const title = ref.current?.querySelectorAll('.title span') || [];

    /** Set initial state for SVG paths */
    [...paths].forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        fill: 'none',
        stroke: '#525252',
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });

    /** Calculate circle length for animation */
    const circleLength = Math.round(circleRef.current.getTotalLength());
    /** Configure entrance animation sequence */
    triggerTl
      .set(title, { autoAlpha: 0, xPercent: 100 })
      .set(circleRef.current, {
        strokeDashoffset: circleLength,
        strokeDasharray: circleLength,
      })
      .fromTo(
        ref.current,
        { autoAlpha: 0, scale: 0, yPercent: 50 },
        {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          delay: index / 10,
          duration: 0.85,
        },
      )
      .to([circleRef.current, paths], {
        strokeDashoffset: 0,
        duration: 1.25,
        delay: index / 10,
      })
      .to(
        paths,
        { stroke: 'none', fill: '#525252', delay: -index / 10 },
        '-=0.85',
      )
      .to(
        title,
        { autoAlpha: 1, xPercent: 0, delay: -0.5, duration: 1, stagger: 0.1 },
        '-=0.45',
      )
      .set(paths, { clearProps: 'fill, stroke' });

    return () => triggerTl.kill();
  }, [readyState]);

  /** Handle stage transitions for leaving animation */
  useGSAP(() => {
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
  }, [stage, readyState, triggerRef, inView]);

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
