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
  const ref = useRef<HTMLDivElement>(null);

  /** Handle open/close animations based on transition state */
  useGSAP(() => {
    if (!open || !ref.current) {
      return;
    }
    /**
     * Animate this drawer's own nodes instead of the global
     * '#modalBg, #modalBody' selector: the forms modal renders the same ids,
     * so a document-wide selector could target the wrong element.
     * `#modalBody` is this wrapper itself; `#modalBg` is the backdrop inside.
     */
    const body = ref.current;
    const bg = body.querySelector('#modalBg');

    const tl = gsap.timeline({
      paused: true,
    });

    /** Animate closing transition */
    if (transition === 'close') {
      tl.to([bg, body], {
        xPercent: -150,
        autoAlpha: 0,
        onComplete: () => {
          setTransition('');
          setOpen(false);
        },
      }).play();
      /** Animate opening transition */
    } else if (open) {
      tl.set([bg, body], {
        xPercent: -150,
        autoAlpha: 0,
      })
        .to(bg, {
          xPercent: 0,
          autoAlpha: 1,
        })
        .to(body, {
          xPercent: 0,
          autoAlpha: 1,
        })
        .to(bg, {
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
