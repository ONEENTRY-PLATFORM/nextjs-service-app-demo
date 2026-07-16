'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

/**
 * Profile menu animations on state change
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - children ReactNode
 * @param   {string}      props.className - CSS className of ref element
 * @param   {boolean}     props.state     - open/closed state of the menu
 * @returns {JSX.Element}                 Profile menu wrapper with animations
 */
const ProfileMenuAnimations = ({
  children,
  className,
  state,
}: {
  children: ReactNode;
  className: string;
  state: boolean;
}): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  /** Build the open/close timeline once and keep it across state changes */
  useGSAP(
    () => {
      if (!ref.current) {
        return;
      }

      /** Set initial hidden state so reverse() lands on the correct values */
      gsap.set(ref.current, { autoAlpha: 0, height: 0 });

      timelineRef.current = gsap.timeline({ paused: true }).to(ref.current, {
        autoAlpha: 1,
        height: 'auto',
        duration: 0.5,
      });
    },
    { dependencies: [], scope: ref },
  );

  /** Play or reverse the persistent timeline when state changes */
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) {
      return;
    }
    if (state) {
      tl.play();
    } else {
      tl.reverse();
    }
  }, [state]);

  /** Render animated profile menu container */
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ProfileMenuAnimations;
