'use client';

import { X } from 'lucide-react';
import type { JSX } from 'react';

import { useDialogA11y } from '@/components/shared/useDialogA11y';

/**
 * CancelConfirmModal — the "Cancel this appointment?" confirmation dialog from
 * the static-html mock (`AccountPage.tsx`): pink X in a light circle, the
 * visit line, the free-cancellation note and a gradient "Keep appointment" /
 * outlined "Yes, cancel" button pair.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.subtitle  - Visit line ("Master · date at time"), empty hides it
 * @param   {() => void}  props.onKeep    - Keep the appointment (close without cancelling)
 * @param   {() => void}  props.onConfirm - Proceed with the cancellation
 * @returns {JSX.Element}                 JSX.Element representing the confirmation dialog
 */
const CancelConfirmModal = ({
  subtitle,
  onKeep,
  onConfirm,
}: {
  subtitle: string;
  onKeep: () => void;
  onConfirm: () => void;
}): JSX.Element => {
  /** Dialog a11y: focus trap/restore, scroll lock and Escape → keep. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose: onKeep });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Cancel this appointment?"
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,20,30,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onKeep();
        }
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-50">
          <X size={26} color="#ed21f1" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-slate-400">
          Cancel this appointment?
        </h3>
        {subtitle ? (
          <p className="mb-2 text-sm text-neutral-300">{subtitle}</p>
        ) : null}
        <p className="mb-5 text-base text-neutral-300">
          Free cancellation up to 24 hours before your appointment.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onKeep}
            className="flex-1 rounded-xl bg-gradient-brand py-2.5 text-base font-bold text-white transition-all hover:opacity-90"
          >
            Keep appointment
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-slate-150 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:bg-gray-50"
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmModal;
