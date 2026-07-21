'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

import { useAppSelector } from '@/app/store/hooks';

/**
 * BgAnimations component to add background animations to the catalog section.
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to apply animations to
 * @param   {string}      props.className - CSS classes to apply to the wrapper element
 * @returns {JSX.Element}                 JSX.Element with animated background elements
 */
const BgAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  /** Get current transition stage from transition state */
  const { stage } = useTransitionState();
  /** Reference to the main background element */
  const ref = useRef<HTMLDivElement>(null);

  /** Get animation ready state from Redux store */
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Fade the background characters in with a stagger when the section enters the viewport */
  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !readyState) {
        return;
      }

      /** Both words in document order, so the stagger runs line 1 then line 2 */
      const chars = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('span'),
      );
      if (chars.length === 0) {
        return;
      }

      const tween = gsap.fromTo(
        chars,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 1.2,
          ease: 'power1.out',
          stagger: 0.05,
          scrollTrigger: {
            trigger: root,
            /* The hero above is fixed-height, so this section always rests the
               same ~680px down the document — any start line below that is
               already crossed at load and the reveal would play unseen, before
               the user scrolls at all. `top 75%` did exactly that on every
               viewport taller than ~900px (the common case). 45% keeps it a real
               scroll reveal up to ~1500px-tall viewports. */
            start: 'top 45%',
            end: 'bottom top',
            toggleActions: 'play none none reverse',
          },
        },
      );

      /**
         A client-side route change mounts this mid-page, where the trigger's own
         measurements are taken before the incoming layout settles; without a
         refresh the characters can stay stuck at autoAlpha 0.
       */
      ScrollTrigger.refresh();

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [readyState], scope: ref },
  );

  /** Fade the whole block out while the router transitions away, and restore it otherwise */
  useGSAP(
    () => {
      if (stage === 'leaving') {
        gsap.to(ref.current, {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      } else {
        gsap.set(ref.current, { autoAlpha: 1 });
      }
    },
    { dependencies: [stage], scope: ref },
  );

  /** Render background animations container with children */
  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default BgAnimations;
