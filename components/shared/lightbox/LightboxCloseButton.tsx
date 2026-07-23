'use client';

import { X } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

/**
 * LightboxCloseButton — the ring-bordered × in the top-right corner of a
 * fullscreen viewer.
 * @param   {object}      props         - Component properties
 * @param   {() => void}  props.onClose - Close the viewer
 * @param   {number}      [props.size]  - Icon size in px (default `17`)
 * @returns {JSX.Element}               Close button
 */
const LightboxCloseButton = ({
  onClose,
  size = 17,
}: {
  onClose: () => void;
  size?: number | undefined;
}): JSX.Element => {
  const dict = useDict();

  return (
    <button
      onClick={onClose}
      aria-label={(dict?.close_text?.value as string | undefined) || 'Close'}
      className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
      style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
    >
      <X size={size} color="#fff" />
    </button>
  );
};

export default LightboxCloseButton;
