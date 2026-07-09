'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX } from 'react';
import { useRef } from 'react';

import { useAppSelector } from '@/app/store/hooks';

import LogoIcon from './LogoIcon';

/**
 * Loader component with animation effects.
 *
 * This component renders an animated loader using the logo icon with SVG path animations.
 * It uses GSAP to create a drawing animation effect on the logo paths. The loader features
 * a repeating yoyo animation that draws the logo paths sequentially.
 *
 * The component is connected to the Redux store to check animation readiness state
 * before starting animations.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.className - CSS classes to apply to the loader container
 * @returns {JSX.Element}                 JSX.Element representing the animated loader component
 */
const Loader = ({ className }: { className: string }): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );

  /** Loading animations */
  useGSAP(
    () => {
      if (!readyState) {
        return;
      }

      /** Paths */
      const beautyPaths = ref.current!.querySelectorAll('.beauty');
      const salonPaths = ref.current!.querySelectorAll('.salon');

      /** timelines */
      const loaderTl = gsap.timeline({
        id: 'loaderTl',
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.5,
      });

      /** set paths attrs */
      [...beautyPaths, ...salonPaths].map((path) => {
        const length = (path as SVGPathElement).getTotalLength();

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      /** beautyPaths */
      loaderTl
        .to([...beautyPaths], {
          strokeDashoffset: 0,
          duration: 0.65,
          stagger: 0.15,
        })
        .to(
          [...salonPaths],
          {
            strokeDashoffset: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          '-=0.25',
        );

      loaderTl.play();

      return () => {
        loaderTl.kill();
      };
    },
    { scope: ref, dependencies: [readyState] },
  );

  return (
    <div
      ref={ref}
      className={
        'w-full overflow-hidden flex justify-center items-center ' + className
      }
    >
      <LogoIcon className={''} fill={'none'} stroke={'#292A2C'} />
    </div>
  );
};

export default Loader;
