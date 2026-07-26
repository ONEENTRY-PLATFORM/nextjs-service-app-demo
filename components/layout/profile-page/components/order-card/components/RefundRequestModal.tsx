'use client';

import { Banknote } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import CurrencySymbol from '@/components/shared/CurrencySymbol';
import DialogPortal from '@/components/shared/DialogPortal';
import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { dictText } from '@/components/utils/dictText';

/**
 * RefundRequestModal — what a paid appointment gets instead of the dead-end
 * "contact the salon" error: the cancellation itself is impossible online
 * (the money has moved), but `Orders.createRefundRequest` lets the guest ask
 * for it back without leaving the profile.
 * @param   {object}        props            - Component properties
 * @param   {string}        props.subtitle   - Visit line ("Master · date at time"), empty hides it
 * @param   {string | null} props.total      - Amount to be refunded, formatted; `null` hides the line
 * @param   {string}        [props.currency] - Currency code of the order, for the glyph
 * @param   {boolean}       props.isPending  - Refund request in flight — blocks a second submit
 * @param   {() => void}    props.onClose    - Dismiss without asking for a refund
 * @param   {() => void}    props.onConfirm  - Send the refund request
 * @returns {JSX.Element}                    JSX.Element representing the refund dialog
 */
const RefundRequestModal = ({
  subtitle,
  total,
  currency,
  isPending,
  onClose,
  onConfirm,
}: {
  subtitle: string;
  total: string | null;
  currency?: string | undefined;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}): JSX.Element => {
  const dict = useDict();

  /** Dialog a11y: focus trap/restore, scroll lock and Escape → close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose });

  return (
    <DialogPortal>
      <div
        ref={dialogRef}
        data-testid="order-refund-request"
        role="dialog"
        aria-modal="true"
        aria-label={dictText(dict, 'request_refund_title', 'Request a refund')}
        className="fixed inset-0 z-300 flex items-center justify-center p-4"
        style={{ background: 'rgba(20,20,30,0.45)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-modal">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-50">
            <Banknote size={26} color="#ed21f1" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-slate-400">
            {dictText(dict, 'request_refund_title', 'Request a refund')}
          </h3>
          {subtitle ? (
            <p className="mb-2 text-sm text-neutral-300">{subtitle}</p>
          ) : null}
          <p className="mb-3 text-base text-neutral-300">
            {dictText(
              dict,
              'refund_explain_text',
              'This appointment has already been paid, so it can’t be cancelled online. We can send the salon a refund request — they confirm it and return the money to your payment method.',
            )}
          </p>
          {total ? (
            <p className="mb-5 text-base font-bold text-slate-400">
              <CurrencySymbol currency={currency} />
              {total}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              disabled={isPending}
              data-testid="order-refund-confirm"
              className="flex-1 rounded-xl bg-gradient-brand py-2.5 text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            >
              {isPending
                ? dictText(dict, 'sending_text', 'Sending…')
                : dictText(dict, 'request_refund_button', 'Request refund')}
            </button>
            <button
              onClick={onClose}
              data-testid="order-refund-dismiss"
              className="flex-1 rounded-xl border border-slate-150 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:bg-gray-50"
            >
              {dictText(dict, 'not_now_text', 'Not now')}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
};

export default RefundRequestModal;
