'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

import { useAppSelector } from '@/app/store/hooks';
import { selectTabsState } from '@/app/store/reducers/CartSlice';

/**
 * Calendar animations.
 * @param   {object}      props           - Calendar animations props.
 * @param   {ReactNode}   props.children  - children ReactNode.
 * @param   {string}      props.className - CSS className of ref element.
 * @param   {string}      props.tabKey    - tab key.
 * @returns {JSX.Element}                 Calendar animations.
 */
const CalendarAnimations = ({
  children,
  className,
  tabKey,
}: {
  children: ReactNode;
  className: string;
  tabKey:
    | 'salons'
    | 'services'
    | 'products'
    | 'masters'
    | 'calendar'
    | 'signin'
    | 'payment';
}): JSX.Element => {
  const ref = useRef(null);

  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Get the current tab state to determine if calendar is active */
  const { isActive } = useAppSelector((state) =>
    selectTabsState(tabKey, state),
  );

  /** Form transition animations for calendar component */
  useGSAP(() => {
    /** Early return if animations are not ready */
    if (!readyState) {
      return;
    }

    /** Create timeline for calendar animations */
    const tl = gsap.timeline({
      paused: true,
    });

    /** Animate calendar elements: weekdays and buttons with staggered effect */
    tl.fromTo(
      [
        '.react-calendar__month-view__weekdays__weekday abbr',
        '.react-calendar button',
      ],
      {
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        delay: 0.15,
        stagger: 0.01,
      },
    );

    /** Play animation when calendar tab is active */
    if (isActive) {
      tl.play();
    }

    /** Reverse animation when calendar tab is inactive */
    if (!isActive) {
      tl.reverse(3);
    }

    /** Cleanup timeline on unmount to prevent memory leaks */
    return () => {
      tl.kill();
    };
  }, [isActive, readyState]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default CalendarAnimations;
