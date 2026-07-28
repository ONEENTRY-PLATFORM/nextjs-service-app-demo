'use client';

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { useLightboxTransition } from '@/components/shared/lightbox/useLightboxTransition';
import { useDialogA11y } from '@/components/shared/useDialogA11y';

/**
 * The wiring every animated dialog repeats.
 * @property {RefObject<HTMLDivElement | null>} dialogRef    - Attach to the overlay: focus trap, focus restore, scroll lock, Escape
 * @property {RefObject<HTMLDivElement | null>} contentRef   - Attach to the content column — the element the open/close animation scales
 * @property {() => void}                       requestClose - Animated close: wire to the close button, backdrop click and any dismiss
 */
export interface AnimatedDialog {
  dialogRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  requestClose: () => void;
}

/**
 * useAnimatedDialog — the dialog chrome shared by the fullscreen viewers and
 * the offer booking modal: the a11y ref (focus trap, focus restore, scroll
 * lock, Escape-to-close) composed with the animated open/close of
 * `useLightboxTransition`.
 *
 * Escape closes through the a11y hook, which is created before the animated
 * `requestClose` exists; the stable `closeRef` indirection forwards to the
 * current closer so Escape plays the exit tween too. It is re-pointed in an
 * effect, never during render — a ref written while rendering is invisible to
 * a concurrent re-render that discards the pass.
 *
 * `escapeLockedRef` suspends ONLY the Escape path. It exists for stacked
 * dialogs: when the sign-in popup opens over the offer modal, both dialogs
 * hold a document-level Escape listener and one keypress would close both —
 * the modal locks its own Escape while the popup (or an in-flight submit)
 * owns the interaction. The returned `requestClose` is NOT gated: callers
 * gate their own pointer paths so programmatic closes stay possible.
 * @param   {object}                            input                   - Hook input
 * @param   {() => void}                        input.onClose           - Real close (unmounts the dialog), run after the exit tween
 * @param   {RefObject<boolean>}                [input.escapeLockedRef] - When `.current` is true, Escape is ignored
 * @returns {AnimatedDialog}                                            The dialog refs and the animated closer
 */
export const useAnimatedDialog = ({
  onClose,
  escapeLockedRef,
}: {
  onClose: () => void;
  escapeLockedRef?: RefObject<boolean> | undefined;
}): AnimatedDialog => {
  const contentRef = useRef<HTMLDivElement>(null);

  const closeRef = useRef(onClose);
  const routedClose = useCallback(() => {
    if (escapeLockedRef?.current) return;
    closeRef.current();
  }, [escapeLockedRef]);

  const dialogRef = useDialogA11y({ isOpen: true, onClose: routedClose });

  const { requestClose } = useLightboxTransition({
    overlayRef: dialogRef,
    contentRef,
    onClose,
  });
  useEffect(() => {
    closeRef.current = requestClose;
  });

  return { dialogRef, contentRef, requestClose };
};
