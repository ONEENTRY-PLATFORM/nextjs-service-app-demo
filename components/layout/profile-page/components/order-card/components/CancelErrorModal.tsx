'use client';

import { AlertTriangle } from 'lucide-react';
import type { JSX } from 'react';

import DialogPortal from '@/components/shared/DialogPortal';
import { useDialogA11y } from '@/components/shared/useDialogA11y';

/**
 * CancelErrorModal — the failure counterpart of `CancelSuccessModal`: the
 * same dialog shell, an amber warning circle instead of the gradient check and
 * the reason the cancellation was refused. Replaces the raw error toast, which
 * showed the server's `updateOrder` wording and vanished before it could be
 * read.
 * Also serves the refund branch, which fails for its own reasons ("You cannot
 * refund uncompleted order") — hence the overridable `title`, so the dialog
 * doesn't claim a cancellation was attempted when a refund was.
 * @param   {object}      props         - Component properties
 * @param   {string}      props.message - Why the action failed (already user-facing)
 * @param   {string}      [props.title] - Dialog headline; defaults to the cancellation wording
 * @param   {() => void}  props.onClose - Close the dialog
 * @returns {JSX.Element}               JSX.Element representing the error dialog
 */
const CancelErrorModal = ({
  message,
  title = 'Appointment not cancelled',
  onClose,
}: {
  message: string;
  title?: string;
  onClose: () => void;
}): JSX.Element => {
  /** Dialog a11y: focus trap/restore, scroll lock and Escape → close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose });

  return (
    <DialogPortal>
      <div
        ref={dialogRef}
        data-testid="order-cancel-error"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-300 flex items-center justify-center p-4"
        style={{ background: 'rgba(20,20,30,0.45)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle size={30} color="#d97706" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-slate-400">{title}</h3>
          <p className="mb-5 text-base text-neutral-300">{message}</p>
          <button
            onClick={onClose}
            data-testid="order-cancel-error-close"
            className="w-full rounded-xl bg-gradient-brand py-2.5 text-base font-bold text-white transition-all hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </DialogPortal>
  );
};

export default CancelErrorModal;
