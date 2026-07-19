'use client';

import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { useDialogA11y } from '@/components/shared/useDialogA11y';

/**
 * CancelSuccessModal — the "Appointment cancelled" dialog from the static-html
 * mock (`AccountPage.tsx`): a glowing gradient check circle, the confirmation
 * copy and a full-width gradient "Done" button.
 * @param   {object}      props        - Component properties
 * @param   {() => void}  props.onDone - Close the dialog
 * @returns {JSX.Element}              JSX.Element representing the success dialog
 */
const CancelSuccessModal = ({
  onDone,
}: {
  onDone: () => void;
}): JSX.Element => {
  /** Dialog a11y: focus trap/restore, scroll lock and Escape → close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose: onDone });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Appointment cancelled"
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,20,30,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onDone();
        }
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-brand shadow-[0_0_28px_rgba(237,33,241,0.27)]">
          <Check size={30} color="#fff" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-slate-400">
          Appointment cancelled
        </h3>
        <p className="mb-5 text-base text-neutral-300">
          Your appointment has been cancelled and moved to “Canceled”.
        </p>
        <button
          onClick={onDone}
          className="w-full rounded-xl bg-gradient-brand py-2.5 text-base font-bold text-white transition-all hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default CancelSuccessModal;
