'use client';

import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import CloseButton from '@/components/shared/CloseButton';

/**
 * Close modal button — the × in the gradient header of the forms modal.
 *
 * Only the wiring to {@link OpenDrawerContext} lives here; the look is the
 * shared {@link CloseButton} `accent` tone, so this cross matches the one in
 * every other popup. Closing goes through `transition: 'close'` so the closing
 * animation still plays.
 * @returns {JSX.Element} Close modal button
 */
const CloseModal = (): JSX.Element => {
  /** Get setTransition function from OpenDrawerContext to control modal state */
  const { setTransition } = useContext(OpenDrawerContext);

  return <CloseButton onClose={() => setTransition('close')} />;
};

export default CloseModal;
