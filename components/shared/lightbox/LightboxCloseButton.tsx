'use client';

import type { JSX } from 'react';

import CloseButton from '@/components/shared/CloseButton';

/**
 * LightboxCloseButton — the ring-bordered × in the top-right corner of a
 * fullscreen viewer: the shared {@link CloseButton} in its `overlay` tone,
 * pinned for every lightbox in one place.
 * @param   {object}      props         - Component properties
 * @param   {() => void}  props.onClose - Close the viewer
 * @param   {number}      [props.size]  - Icon size in px (default `17`)
 * @returns {JSX.Element}               Close button
 */
const LightboxCloseButton = ({
  onClose,
  size,
}: {
  onClose: () => void;
  size?: number | undefined;
}): JSX.Element => (
  <CloseButton
    onClose={onClose}
    tone="overlay"
    {...(size === undefined ? {} : { size })}
    className="absolute top-5 right-5 z-10"
  />
);

export default LightboxCloseButton;
