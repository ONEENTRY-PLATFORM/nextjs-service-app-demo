'use client';

import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import DialogPortal from '@/components/shared/DialogPortal';
import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { dictText } from '@/components/utils/dictText';

/**
 * CancelSuccessModal — the "Appointment cancelled" dialog: a glowing gradient check circle, the confirmation
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
  const dict = useDict();

  /** Dialog a11y: focus trap/restore, scroll lock and Escape → close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose: onDone });

  return (
    <DialogPortal>
      <div
        ref={dialogRef}
        data-testid="order-cancel-success"
        role="dialog"
        aria-modal="true"
        aria-label={dictText(
          dict,
          'appointment_cancelled_title',
          'Appointment cancelled',
        )}
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
            {dictText(
              dict,
              'appointment_cancelled_title',
              'Appointment cancelled',
            )}
          </h3>
          <p className="mb-5 text-base text-neutral-300">
            {dictText(
              dict,
              'appointment_cancelled_desc',
              'Your appointment has been cancelled and moved to “Canceled”.',
            )}
          </p>
          <button
            onClick={onDone}
            data-testid="order-cancel-done"
            className="w-full rounded-xl bg-gradient-brand py-2.5 text-base font-bold text-white transition-all hover:opacity-90"
          >
            {dictText(dict, 'done_text', 'Done')}
          </button>
        </div>
      </div>
    </DialogPortal>
  );
};

export default CancelSuccessModal;
