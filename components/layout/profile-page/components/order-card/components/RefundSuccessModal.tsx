'use client';

import { Check } from 'lucide-react';
import type { JSX } from 'react';

import DialogPortal from '@/components/shared/DialogPortal';
import { useDialogA11y } from '@/components/shared/useDialogA11y';

/**
 * RefundSuccessModal — confirmation that the refund request reached the salon.
 *
 * Deliberately does not promise a cancelled visit: `createRefundRequest` only
 * registers the request, the salon confirms it and moves the money back, so the
 * appointment keeps its current status until then.
 * @param   {object}      props        - Component properties
 * @param   {() => void}  props.onDone - Close the dialog
 * @returns {JSX.Element}              JSX.Element representing the success dialog
 */
const RefundSuccessModal = ({
  onDone,
}: {
  onDone: () => void;
}): JSX.Element => {
  /** Dialog a11y: focus trap/restore, scroll lock and Escape → close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose: onDone });

  return (
    <DialogPortal>
      <div
        ref={dialogRef}
        data-testid="order-refund-success"
        role="dialog"
        aria-modal="true"
        aria-label="Refund requested"
        className="fixed inset-0 z-300 flex items-center justify-center p-4"
        style={{ background: 'rgba(20,20,30,0.45)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onDone();
          }
        }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-modal">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-brand shadow-[0_0_28px_rgba(237,33,241,0.27)]">
            <Check size={30} color="#fff" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-slate-400">
            Refund requested
          </h3>
          <p className="mb-5 text-base text-neutral-300">
            The salon has received your refund request. They will confirm it and
            return the money to your payment method — the appointment stays in
            your list until then.
          </p>
          <button
            onClick={onDone}
            data-testid="order-refund-done"
            className="w-full rounded-xl bg-gradient-brand py-2.5 text-base font-bold text-white transition-all hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </DialogPortal>
  );
};

export default RefundSuccessModal;
