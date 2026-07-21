'use client';

import type { CSSProperties, JSX, ReactNode, RefObject } from 'react';

/**
 * LightboxOverlay — the backdrop every fullscreen viewer sits on: a labelled
 * modal dialog pinned over the page that closes when the backdrop itself (never
 * a child) is clicked.
 *
 * `z-300` on purpose: the fixed header sits at `z-245`, so a lower level would
 * let it cover the close button and the counter.
 * @param   {object}                         props             - Component properties
 * @param   {RefObject<HTMLDivElement|null>} props.dialogRef   - Ref from `useLightboxNav`
 * @param   {string}                         props.label       - `aria-label` of the dialog
 * @param   {CSSProperties}                  props.style       - Backdrop background / blur
 * @param   {() => void}                     props.onClose     - Close the viewer
 * @param   {ReactNode}                      props.children    - Chrome and stage of the viewer
 * @param   {string}                         [props.testId]    - `data-testid` for e2e selectors
 * @param   {string}                         [props.className] - Extra classes for the backdrop
 * @returns {JSX.Element}                                      Backdrop element
 */
const LightboxOverlay = ({
  dialogRef,
  label,
  style,
  onClose,
  children,
  testId,
  className = '',
}: {
  dialogRef: RefObject<HTMLDivElement | null>;
  label: string;
  style: CSSProperties;
  onClose: () => void;
  children: ReactNode;
  testId?: string | undefined;
  className?: string | undefined;
}): JSX.Element => (
  <div
    ref={dialogRef}
    data-testid={testId}
    role="dialog"
    aria-modal="true"
    aria-label={label}
    className={`fixed inset-0 z-300 flex items-center justify-center ${className}`}
    style={style}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    {children}
  </div>
);

export default LightboxOverlay;
