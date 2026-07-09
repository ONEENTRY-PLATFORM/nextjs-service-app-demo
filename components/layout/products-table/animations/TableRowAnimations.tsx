'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { CSSProperties, JSX, MouseEventHandler, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * TableRowAnimations
 * @param   {object}                                 props           - Props
 * @param   {ReactNode}                              props.children  - children ReactNode
 * @param   {string}                                 props.className - CSS className of ref element
 * @param   {number}                                 props.index     - Index of element for animations stagger
 * @param   {MouseEventHandler<HTMLTableRowElement>} props.onClick   - Click handler function
 * @param   {object}                                 props.style     - CSS style of ref element
 * @returns {JSX.Element}                                            JSX.Element with animated ref
 */
const TableRowAnimations = ({
  children,
  className,
  style,
  onClick,
  index = 0,
}: {
  children: ReactNode;
  className: string;
  style: CSSProperties;
  onClick: MouseEventHandler<HTMLTableRowElement>;
  index: number;
}): JSX.Element => {
  /** Get current transition stage from Redux store */
  const { stage } = useTransitionState();
  /** Track previous transition stage to detect changes */
  const [prevStage, setPrevStage] = useState<string>('');
  /** Create ref for the table row element */
  const ref = useRef<HTMLTableRowElement>(null);
  /** Track if table row is in view for animation triggering */
  const [inView, setInView] = useState<boolean>(false);
  /** Store reference to the scroll-triggered timeline */
  const [triggerRef, setTriggerRef] = useState<gsap.core.Timeline>();

  /** Get animation ready state from Redux store */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Initialize scroll-triggered animation when component is ready */
  useGSAP(() => {
    if (!readyState) {
      return;
    }
    /** Create timeline for scroll-triggered animation */
    const triggerTl = gsap.timeline({
      id: 'tableRowTriggerTl',
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
    /** Store timeline reference for later use */
    setTriggerRef(triggerTl);

    /** Animate table row entrance on scroll */
    triggerTl.fromTo(
      ref.current,
      {
        autoAlpha: 0,
        x: -50,
      },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.5,
        delay: index * 0.1,
      },
    );

    /** Cleanup timeline on unmount */
    return () => {
      triggerTl.kill();
    };
  }, [readyState, index]);

  /** Handle stage transitions for leaving animation */
  useGSAP(() => {
    /** Create timeline for stage transition animations */
    const stageTl = gsap.timeline({
      paused: true,
    });

    /** Play leaving animation when transitioning out */
    if (stage === 'leaving' && prevStage === 'none') {
      triggerRef?.kill();
      if (inView) {
        stageTl
          .to(ref.current, {
            autoAlpha: 0,
            x: -50,
            duration: 0.35,
          })
          .play();
      }
    }

    /** Update previous stage for transition tracking */
    setPrevStage(stage);

    /** Cleanup timeline on unmount */
    return () => {
      stageTl.kill();
    };
  }, [stage, readyState, triggerRef, inView]);

  /** Render animated table row with children content */
  return (
    <tr ref={ref} className={className} style={style} onClick={onClick}>
      {children}
    </tr>
  );
};

export default TableRowAnimations;
