'use client';

import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { BRAND_GRADIENT, DARK, MUTED, PINK } from '../constants';

/**
 * SuccessModal — the "Booked!" confirmation modal of the booking wizard,
 * ported from the static-html mock (`BookingPage.tsx` → `SuccessModal`):
 * a blurred purple backdrop, a gradient check circle, the confirmation text
 * and a Close button.
 * @param   {object}      props         - Component properties
 * @param   {() => void}  props.onClose - Close the modal
 * @returns {JSX.Element}               Success modal
 */
const SuccessModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
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
        <h2 className="mb-2 text-xl font-bold" style={{ color: DARK }}>
          Booked!
        </h2>
        <p className="mb-6 text-base" style={{ color: MUTED }}>
          Your appointment has been confirmed. We&apos;ll send you a reminder.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-xl py-3.5 text-base font-bold tracking-wider text-white uppercase"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: `0 8px 24px ${PINK}44`,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
