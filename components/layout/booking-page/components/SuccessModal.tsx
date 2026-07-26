'use client';

import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import { BRAND_GRADIENT, PINK } from '../constants';

/**
 * SuccessModal — the "Booked!" confirmation modal of the booking wizard:
 * a blurred purple backdrop, a gradient check circle, the confirmation text
 * and a Close button.
 * @param   {object}      props         - Component properties
 * @param   {() => void}  props.onClose - Close the modal
 * @returns {JSX.Element}               Success modal
 */
const SuccessModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const dict = useDict();

  return (
    <div
      data-testid="booking-success"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,0,40,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-10 text-center"
        style={{ boxShadow: `0 24px 80px ${PINK}33` }}
      >
        <div
          className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: `0 0 40px ${PINK}55`,
          }}
        >
          <Check size={36} color="#fff" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-400">
          {dictText(dict, 'booking_success_title', 'Booked!')}
        </h2>
        <p className="mb-6 text-base text-neutral-300">
          {dictText(
            dict,
            'booking_success_desc',
            "Your appointment has been confirmed. We'll send you a reminder.",
          )}
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-xl py-3.5 text-base font-bold tracking-wider text-white uppercase"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: `0 8px 24px ${PINK}44`,
          }}
        >
          {dictText(dict, 'close_text', 'Close')}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
