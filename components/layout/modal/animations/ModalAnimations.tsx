'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useContext, useRef } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * ModalAnimations component provides open/close animations for modal dialogs
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements to be rendered inside the modal
 * @param   {string}      props.component - Name of the component being rendered in the modal, affects animation duration
 * @returns {JSX.Element}                 Modal wrapper with open/close animations or empty fragment if not open
 */
const ModalAnimations = ({
  children,
  component,
}: {
  children: ReactNode;
  component: string;
}): JSX.Element => {
  /** Get modal state and transition control functions from context */
  const { open, transition, setOpen, setTransition } =
    useContext(OpenDrawerContext);
  /** Create ref for the modal container element */
  const ref = useRef(null);

  /** Handle modal open/close animations based on transition state */
  useGSAP(
    () => {
      /** Exit early if ref is not attached or modal is not open */
      if (!ref.current || !open) {
        return;
      }

      /** Get modal background and body (the card) elements */
      const modalBg = (ref.current as HTMLDivElement).querySelector('#modalBg');
      const modalBody = (ref.current as HTMLDivElement).querySelector(
        '#modalBody',
      );

      /**
       * Closing: shrink + drop the card while fading the backdrop, then unmount.
       * The card scale/translate is safe — `#modalBody` is the inner element, so
       * GSAP never fights the wrapper's centering transform.
       */
      if (transition === 'close') {
        const duration = component !== 'CalendarForm' ? 0.3 : 1.2;
        const tl = gsap.timeline({
          onComplete: () => {
            setOpen(false);
            setTransition('');
          },
        });
        tl.to(modalBody, {
          autoAlpha: 0,
          scale: 0.9,
          y: 20,
          duration,
          ease: 'power2.in',
        }).to(modalBg, { autoAlpha: 0, duration }, '<');

        return () => {
          tl.kill();
        };
      }

      /**
       * Opening: spring-like pop-in of the card (scale 0.88 → 1, rise 24 → 0)
       * over a backdrop fade + blur, mirroring the static-html AuthModal
       * (motion spring stiffness 320 / damping 28 ≈ `back.out(1.4)`).
       */
      const tl = gsap.timeline({
        onComplete: () => {
          setTransition('');
        },
      });
      tl.set(modalBg, { autoAlpha: 0 })
        .set(modalBody, { autoAlpha: 0, scale: 0.88, y: 24 })
        .to(modalBg, { autoAlpha: 1, duration: 0.3 })
        .to(modalBg, { backdropFilter: 'blur(10px)', duration: 0.3 }, '<')
        .to(
          modalBody,
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: 'back.out(1.4)',
          },
          '<',
        );

      /** Cleanup function to kill timeline on unmount */
      return () => {
        tl.kill();
      };
    },
    { dependencies: [open, transition], scope: ref },
  );

  /** Don't render if modal is not open */
  if (!open) {
    return <></>;
  }

  /** Render modal animations container */
  return (
    <div ref={ref} className="fixed z-500 flex h-screen w-full">
      {children}
    </div>
  );
};

export default ModalAnimations;
