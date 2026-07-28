'use client';

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

/** Elements that can receive keyboard focus inside a dialog. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * useDialogA11y — the shared accessibility behaviour every modal / lightbox /
 * drawer needs but none had. While the dialog is open it wires up:
 * - focus move-in (first focusable element, else the container itself);
 * - a Tab / Shift+Tab focus trap that cycles within the dialog;
 * - Escape → `onClose`;
 * - background scroll lock (`body { overflow: hidden }`);
 * - focus restore to the element focused before opening, once it closes.
 *
 * Attach the returned ref to the dialog's root element and give that element
 * `role="dialog" aria-modal="true"` plus a label (`aria-label` / `aria-labelledby`).
 * Escape is handled here — callers that also navigate with arrow keys should keep
 * ONLY the arrow keys in their own handler to avoid a duplicate Escape close.
 * @param   {object}              params         - Hook parameters.
 * @param   {boolean}             params.isOpen  - Whether the dialog is currently open.
 * @param   {() => void}          params.onClose - Called on Escape; mirror the dialog's own close.
 * @returns {RefObject<T | null>}                Ref to attach to the dialog's root element.
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  /** Latest onClose, kept in a ref so the trap effect need not depend on it. */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const node = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    /** Lock background scroll for as long as the dialog is open. */
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    /**
     * Collect the dialog's focusable elements on demand (content can change).
     * @returns {HTMLElement[]} Focusable descendants in DOM order.
     */
    const getFocusable = (): HTMLElement[] =>
      node
        ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];

    /**
     * Move focus into the dialog: first focusable, else the container.
     * Deferred by two frames: animated dialogs enter through a GSAP `autoAlpha`
     * tween whose 0-state is `visibility: hidden`, and `focus()` on a hidden
     * element is a silent no-op — the trap then never engages and Tab wanders
     * the page behind the backdrop. Frame one lets the tween's first tick flip
     * visibility on; frame two focuses.
     */
    if (node) {
      node.tabIndex = -1;
    }
    let focusRaf = 0;
    const visibilityRaf = requestAnimationFrame(() => {
      focusRaf = requestAnimationFrame(() => {
        const firstFocusable = getFocusable()[0];
        (firstFocusable ?? node)?.focus();
      });
    });

    /**
     * Escape closes; Tab / Shift+Tab is trapped inside the dialog.
     * @param   {KeyboardEvent} e - The keydown event.
     * @returns {void}
     */
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) {
        return;
      }
      const items = getFocusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        /** Nothing focusable inside — keep focus pinned on the container. */
        e.preventDefault();
        node.focus();
        return;
      }
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(visibilityRaf);
      cancelAnimationFrame(focusRaf);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  return ref;
}
