'use client';

import { gsap } from 'gsap';
import { TransitionRouter } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * Transition provider - main 'stage' transition provider.
 * @param   {object}      props          - Component properties.
 * @param   {ReactNode}   props.children - children ReactNode.
 * @returns {JSX.Element}                TransitionRouter.
 */
export default function TransitionProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <TransitionRouter
      auto={true}
      leave={(next) => {
        if (!ref.current) {
          return;
        }
        const tl = gsap
          .timeline({
            duration: 0.85,
          })
          .set(window, {
            scrollTo: 0,
          })
          .call(next, undefined, 0.85);
        return () => {
          tl.kill();
        };
      }}
      enter={(next) => {
        if (!ref.current) {
          return;
        }

        const tl = gsap
          .timeline()
          .set(ref.current, {
            height: ref.current.clientHeight,
          })
          .to(ref.current, {
            height: 'auto',
            duration: 0.85,
          })
          .call(next, undefined, 0.85);

        return () => {
          tl.kill();
        };
      }}
    >
      <div
        ref={ref}
        className="relative flex grow flex-col justify-between transition-transform duration-500"
      >
        {children}
      </div>
    </TransitionRouter>
  );
}
