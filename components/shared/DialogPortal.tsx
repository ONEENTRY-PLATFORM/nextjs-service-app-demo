'use client';

import type { JSX, ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * DialogPortal — renders a modal overlay into `document.body`.
 *
 * A `position: fixed` overlay is NOT positioned against the viewport when any
 * ancestor carries a `transform`: that ancestor becomes its containing block.
 * The GSAP wrappers of this project (e.g. `CardAnimations` around an order
 * card) leave an inline `transform: matrix(…)` behind even at rest, which used
 * to squeeze the profile's review / cancel dialogs into the card's own box
 * instead of covering the screen (found by `profile-orders.spec`). Mounting the
 * dialog on `document.body` puts it outside every such wrapper.
 *
 * Server rendering simply yields nothing: every consumer mounts the dialog from
 * a user interaction (`useState` in the parent), so it never takes part in
 * hydration and the guard cannot cause a markup mismatch.
 * @param   {object}      props          - Component properties
 * @param   {ReactNode}   props.children - Dialog markup to render on `document.body`
 * @returns {JSX.Element}                The portalled dialog, or nothing on the server
 */
const DialogPortal = ({ children }: { children: ReactNode }): JSX.Element => {
  if (typeof document === 'undefined') {
    return <></>;
  }

  return createPortal(children, document.body);
};

export default DialogPortal;
