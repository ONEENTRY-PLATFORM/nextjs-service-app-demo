'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX } from 'react';
import { useRef, useState } from 'react';

/**
 * Line animation component.
 *
 * This component provides animated line transitions using GSAP. It handles different
 * animation states during page transitions including loading, entering, and leaving states.
 * The animation uses SVG path morphing to create smooth transitions.
 *
 * The component integrates with next-transition-router to respond to page transition states
 * and creates timeline animations that morph SVG paths to create visual transitions.
 * @param   {object}      props           - Component properties.
 * @param   {string}      props.className - CSS classes to apply to the line container.
 * @param   {number}      props.delay     - Delay before starting the animation (currently unused).
 * @returns {JSX.Element}                 JSX.Element representing the animated line.
 * @example
 * ```tsx
 * <LineAnimations className="gradient-bg-line" delay={0} />
 * ```
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const LineAnimations = ({
  className,
}: {
  className: string;
  delay: number;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const [prevStage, setPrevStage] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  /** stage animations */
  useGSAP(() => {
    if (!ref.current) {
      return;
    }
    const lineMask = ref.current.querySelectorAll('#line_mask path');

    const stageTl = gsap.timeline({
      paused: true,
    });

    stageTl.to(ref.current, {
      autoAlpha: 0,
      duration: 0.5,
    });

    /** loaderTl */
    const loaderTl = gsap.timeline({
      id: 'heroLoaderTl',
      paused: true,
    });

    /** first loading */
    if (stage === 'none' && prevStage === '') {
      loaderTl
        .to(lineMask, {
          duration: 0.5,
          attr: { d: 'M0 502S175 272 500 272s500 230 500 230V0H0Z' },
          ease: 'power2.in',
        })
        .to(lineMask, {
          duration: 0.5,
          attr: { d: 'M0 2S175 1 500 1s500 1 500 1V0H0Z' },
          ease: 'power2.out',
        })
        .play();
      stageTl.reverse(1);
    }
    // enter stage
    else if (stage === 'entering' && prevStage === 'leaving') {
      loaderTl
        .to(lineMask, {
          duration: 0.5,
          attr: { d: 'M0 502S175 272 500 272s500 230 500 230V0H0Z' },
          ease: 'power2.in',
        })
        .to(lineMask, {
          duration: 0.5,
          attr: { d: 'M0 2S175 1 500 1s500 1 500 1V0H0Z' },
          ease: 'power2.out',
        })
        .play();
      stageTl.reverse(1);
    }
    // leaving stage
    if (stage === 'leaving' && prevStage === 'none') {
      loaderTl
        .set(lineMask, {
          attr: { d: 'M0 1005S175 995 500 995s500 5 500 5V0H0Z' },
        })
        .to(lineMask, {
          attr: { d: 'M0 502S175 272 500 272s500 230 500 230V0H0Z' },
          duration: 0.5,
          ease: 'power2.in',
        })
        .to(lineMask, {
          attr: { d: 'M0 2S175 1 500 1s500 1 500 1V0H0Z' },
          duration: 0.5,
          ease: 'power2.out',
        })
        .reverse(1);
      stageTl.play();
    }

    setPrevStage(stage);

    return () => {
      stageTl.kill();
    };
  }, [stage]);

  return (
    <div className={className} ref={ref}>
      <svg id="line_mask" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path
          fill="#ffffff"
          className="mask_path"
          d="M0 1005S175 995 500 995s500 5 500 5V0H0Z"
        />
      </svg>
    </div>
  );
};

export default LineAnimations;
