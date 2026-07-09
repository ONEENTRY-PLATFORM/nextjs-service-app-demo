import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Close mobile menu modal button
 * @returns {JSX.Element} Close button
 */
const CloseModal = (): JSX.Element => {
  /** Get setTransition function from OpenDrawerContext to control menu state */
  const { setTransition } = useContext(OpenDrawerContext);

  /** Render close button for mobile menu modal */
  return (
    <button
      aria-label="Close menu"
      onClick={() => {
        setTransition('close');
      }}
      className="absolute top-6 right-4 flex aspect-square size-12 shrink-0 items-center justify-center rounded-full border border-[#EEEFF0] text-xl text-slate-700"
    >
      &#10005;
    </button>
  );
};

export default CloseModal;
