import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { useDict } from '@/app/store/providers/useDict';
import CloseButton from '@/components/shared/CloseButton';
import { dictText } from '@/components/utils/dictText';

/**
 * Close mobile menu modal button — the ringed × pinned to the top-right of the
 * drawer, drawn by the shared {@link CloseButton} (`ring` tone).
 * @returns {JSX.Element} Close button
 */
const CloseModal = (): JSX.Element => {
  /** Get setTransition function from OpenDrawerContext to control menu state */
  const { setTransition } = useContext(OpenDrawerContext);
  /** UI-text dictionary for the localized aria-label */
  const dict = useDict();

  return (
    <CloseButton
      onClose={() => setTransition('close')}
      tone="ring"
      className="absolute top-6 right-4"
      label={dictText(dict, 'close_menu_aria', 'Close menu')}
    />
  );
};

export default CloseModal;
