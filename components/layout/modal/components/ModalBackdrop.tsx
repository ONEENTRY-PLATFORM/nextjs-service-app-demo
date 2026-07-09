'use client';

import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Modal Backdrop
 * @returns {JSX.Element} Modal Backdrop
 */
const ModalBackdrop = (): JSX.Element => {
  /** Get setTransition function from OpenDrawerContext to control modal state */
  const { setTransition } = useContext(OpenDrawerContext);

  /** Render backdrop for modal with click handler to close modal */
  return (
    <div
      id="modalBg"
      className="fixed inset-0 size-full min-h-full min-w-full bg-white/30"
      onClick={() => {
        setTransition('close');
      }}
    />
  );
};

export default ModalBackdrop;
