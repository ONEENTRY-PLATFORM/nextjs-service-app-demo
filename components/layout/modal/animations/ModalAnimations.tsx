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
  useGSAP(() => {
    /** Exit early if ref is not attached or modal is not open */
    if (!ref.current || !open) {
      return;
    }
    /** Create timeline for modal animations with completion handlers */
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        /** Clear transition state when animation completes */
        setTransition('');
      },
      onReverseComplete: () => {
        /** Close modal and clear transition state when reverse animation completes */
        setOpen(false);
        setTransition('');
      },
    });

    /** Get modal background and body elements */
    const modalBg = (ref.current as HTMLDivElement).querySelector('#modalBg');
    const modalBody = (ref.current as HTMLDivElement).querySelector(
      '#modalBody',
    );

    /** Animate closing transition */
    if (transition === 'close') {
      /** Different duration for CalendarForm component */
      const duration = component !== 'CalendarForm' ? 0.5 : 1.5;
      tl.to([modalBg, modalBody], {
        autoAlpha: 1,
        duration: duration,
      }).reverse(duration);
      /** Animate opening transition */
    } else {
      tl.set([modalBg, modalBody], {
        autoAlpha: 0,
      })
        .to([modalBg, modalBody], {
          autoAlpha: 1,
        })
        .to(modalBg, {
          backdropFilter: 'blur(10px)',
          delay: -0.35,
        });
      tl.play();
    }

    /** Cleanup function to kill timeline on unmount */
    return () => {
      tl.kill();
    };
  }, [open, transition]);

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
