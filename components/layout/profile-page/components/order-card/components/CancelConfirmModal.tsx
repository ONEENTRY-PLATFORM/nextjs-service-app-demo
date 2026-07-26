'use client';

import { X } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import DialogPortal from '@/components/shared/DialogPortal';
import { useDialogA11y } from '@/components/shared/useDialogA11y';

/**
 * CancelConfirmModal — the "Cancel this appointment?" confirmation dialog from: pink X in a light circle, the
 * visit line, the free-cancellation note and a gradient "Keep appointment" /
 * outlined "Yes, cancel" button pair.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.subtitle  - Visit line ("Master · date at time"), empty hides it
 * @param   {boolean}     props.isPending - Cancellation request in flight — blocks a second submit
 * @param   {() => void}  props.onKeep    - Keep the appointment (close without cancelling)
 * @param   {() => void}  props.onConfirm - Proceed with the cancellation
 * @returns {JSX.Element}                 JSX.Element representing the confirmation dialog
 */
const CancelConfirmModal = ({
  subtitle,
  isPending,
  onKeep,
  onConfirm,
}: {
  subtitle: string;
  isPending: boolean;
  onKeep: () => void;
  onConfirm: () => void;
}): JSX.Element => {
  const dict = useDict();

  /** Dialog a11y: focus trap/restore, scroll lock and Escape → keep. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose: onKeep });

  return (
    <DialogPortal>
      <div
        ref={dialogRef}
        data-testid="order-cancel-confirm"
        role="dialog"
        aria-modal="true"
        aria-label={
          (dict?.cancel_this_appointment_title?.value as string | undefined) ||
          'Cancel this appointment?'
        }
        className="fixed inset-0 z-300 flex items-center justify-center p-4"
        style={{ background: 'rgba(20,20,30,0.45)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onKeep();
          }
        }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-modal">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-50">
            <X size={26} color="#ed21f1" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-slate-400">
            {(dict?.cancel_this_appointment_title?.value as
              string | undefined) || 'Cancel this appointment?'}
          </h3>
          {subtitle ? (
            <p className="mb-2 text-sm text-neutral-300">{subtitle}</p>
          ) : null}
          <p className="mb-5 text-base text-neutral-300">
            {(dict?.free_cancellation_text?.value as string | undefined) ||
              'Free cancellation up to 24 hours before your appointment.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onKeep}
              data-testid="order-cancel-keep"
              className="flex-1 rounded-xl bg-gradient-brand py-2.5 text-base font-bold text-white transition-all hover:opacity-90"
            >
              {(dict?.keep_appointment_text?.value as string | undefined) ||
                'Keep appointment'}
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              data-testid="order-cancel-yes"
              className="flex-1 rounded-xl border border-slate-150 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:bg-gray-50 disabled:opacity-60"
            >
              {isPending
                ? (dict?.cancelling_text?.value as string | undefined) ||
                  'Cancelling…'
                : (dict?.yes_cancel_text?.value as string | undefined) ||
                  'Yes, cancel'}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
};

export default CancelConfirmModal;
