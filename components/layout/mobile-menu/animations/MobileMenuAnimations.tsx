'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useContext, useRef } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Mobile menu open/close animations
 * @param   {object}      props           - props.
 * @param   {ReactNode}   props.children  - children ReactNode
 * @param   {string}      props.className - CSS className of ref element
 * @param   {string}      props.id        - CSS id of ref element
 * @returns {JSX.Element}                 Mobile menu wrapper with animations
 */
const MobileMenuAnimations = ({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className: string;
  id: string;
}): JSX.Element => {
  const { open, transition, setOpen, setTransition } =
    useContext(OpenDrawerContext);
  const ref = useRef(null);

  /** Handle open/close animations based on transition state */
  useGSAP(() => {
    if (!open) {
      return;
    }
    const tl = gsap.timeline({
      paused: true,
    });

    /** Animate closing transition */
    if (transition === 'close') {
      tl.to('#modalBg, #modalBody', {
        xPercent: -150,
        autoAlpha: 0,
        onComplete: () => {
          setTransition('');
          setOpen(false);
        },
      }).play();
      /** Animate opening transition */
    } else if (open) {
      tl.set('#modalBg, #modalBody', {
        xPercent: -150,
        autoAlpha: 0,
      })
        .to('#modalBg', {
          xPercent: 0,
          autoAlpha: 1,
        })
        .to('#modalBody', {
          xPercent: 0,
          autoAlpha: 1,
        })
        .to('#modalBg', {
          backdropFilter: 'blur(10px)',
        })
        .play();
    }

    return () => {
      tl.kill();
    };
  }, [open, transition]);

  /** Don't render if menu is not open */
  if (!open) {
    return <></>;
  }

  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
};

export default MobileMenuAnimations;
