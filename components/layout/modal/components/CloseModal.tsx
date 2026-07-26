'use client';

import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

/**
 * Close modal button
 * @returns {JSX.Element} Close modal button
 */
const CloseModal = (): JSX.Element => {
  /** Get setTransition function from OpenDrawerContext to control modal state */
  const { setTransition } = useContext(OpenDrawerContext);
  /** UI-text dictionary for the localized aria-label */
  const dict = useDict();

  /* Render close button for modal with animation on hover */
  return (
    <button
      onClick={() => setTransition('close')}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-solid border-white/70 transition-transform hover:rotate-90"
      aria-label={dictText(dict, 'close_text', 'Close')}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.21 1.23a1.6 1.6 0 012.24 0l5.54 5.55 5.54-5.55a1.6 1.6 0 112.26 2.24L11.23 9.02l5.54 5.54a1.6 1.6 0 01-2.24 2.26l-5.54-5.54-5.54 5.54a1.6 1.6 0 01-2.26-2.24l5.54-5.54-5.54-5.54a1.6 1.6 0 010-2.24z"
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="0.5"
        />
      </svg>
    </button>
  );
};

export default CloseModal;
