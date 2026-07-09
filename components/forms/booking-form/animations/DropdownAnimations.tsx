'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';
import { selectTabsState } from '@/app/store/reducers/CartSlice';
import type { TabKey } from '@/app/types/global';

/**
 * DropdownAnimations.
 * @param   {object}      props           - Props.
 * @param   {ReactNode}   props.children  - children ReactNode.
 * @param   {string}      props.className - CSS className of ref element.
 * @param   {string}      props.id        - Unique identifier for the element.
 * @param   {number}      props.index     - Index of the element.
 * @param   {string}      props.tabKey    - Tab key identifier.
 * @returns {JSX.Element}                 DropdownAnimations.
 */
const DropdownAnimations = ({
  children,
  className,
  id,
  index,
  tabKey,
}: {
  children: ReactNode;
  className: string;
  id: string;
  index: number;
  tabKey: TabKey;
}): JSX.Element => {
  const { stage, isReady } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const [prevStage, setPrevStage] = useState<string>('');
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** get the current tab state */
  const { isActive } = useAppSelector((state) =>
    selectTabsState(tabKey, state),
  );

  /** Handle stage transition animations for dropdown components */
  useGSAP(() => {
    const stageTl = gsap.timeline();
    if (readyState && isReady) {
      /** Animate dropdown entrance when stage is 'none' */
      if (
        (stage === 'none' && prevStage === '') ||
        (stage === 'none' && prevStage === 'entering') ||
        (stage === 'none' && prevStage === 'none')
      ) {
        stageTl.from(ref.current, {
          autoAlpha: 0,
          duration: 0.35,
          delay: index / 5,
        });
        /** Fade in dropdown with staggered delay based on index */
      } else if (stage === 'leaving' && prevStage === 'none') {
        /** Animate dropdown exit when stage is 'leaving' */
        stageTl.to(ref.current, {
          autoAlpha: 0,
          yPercent: 0,
          duration: 0.35,
          delay: index / 10,
        });
      }
    }

    /** Update previous stage state for animation tracking */
    setPrevStage(stage);

    /** Cleanup timeline on unmount to prevent memory leaks */
    return () => {
      stageTl.kill();
    };
  }, [stage, readyState]);

  /** Handle dropdown open/close animations based on active state */
  useGSAP(() => {
    const tl = gsap.timeline({
      paused: true,
    });

    /** Select dropdown container and items for animation */
    const container =
      ref.current?.querySelectorAll('.dropdown-container') || [];
    const items = ref.current?.querySelectorAll('.dropdown-item') || [];

    /** Animate container height expansion */
    if (container) {
      tl.fromTo(
        container,
        {
          height: 0,
        },
        {
          height: 'auto',
          duration: 0.35,
        },
      );
    }
    /** Animate dropdown items with staggered fade and slide effect */
    if (items) {
      tl.fromTo(
        items,
        {
          autoAlpha: 0,
          yPercent: 10,
        },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.35,
          stagger: 0.05,
        },
      );
    }

    /** Play animation when dropdown is active/open */
    if (isActive) {
      tl.play();
    }
    /** Reverse animation when dropdown is inactive/closed */
    if (!isActive && prevStage !== '') {
      tl.reverse(3);
    }

    /** Cleanup timeline on unmount to prevent memory leaks */
    return () => {
      tl.kill();
    };
  }, [isActive, tabKey]);

  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
};

export default DropdownAnimations;
