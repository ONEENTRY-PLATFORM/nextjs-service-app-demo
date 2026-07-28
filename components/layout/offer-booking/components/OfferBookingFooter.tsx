import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import type { OfferBookingController } from '../hooks/useOfferBooking';
import type { OfferBookingInfo } from '../types';

/**
 * OfferBookingFooter — the sticky action bar of the modal: Continue on the
 * picks step (disabled until the salon, specialist and slot are chosen), Back
 * plus the confirm on the summary step. Signed out, the confirm reads
 * "Sign in to book" and opens the sign-in popup instead of booking. An order
 * error surfaces here, over the buttons.
 * @param   {object}                 props        - Component properties
 * @param   {OfferBookingController} props.wizard - Modal controller
 * @param   {OfferBookingInfo}       props.offer  - The offer being booked (accent styling)
 * @returns {JSX.Element}                         Modal footer
 */
const OfferBookingFooter = ({
  wizard,
  offer,
}: {
  wizard: OfferBookingController;
  offer: OfferBookingInfo;
}): JSX.Element => {
  const dict = useDict();
  const { accentColor, accentGrad } = offer;

  return (
    <div className="border-t px-7 py-4" style={{ borderColor: '#e8e8f0' }}>
      {wizard.error && (
        <p
          className="mb-2 text-sm text-red-500"
          role="alert"
          data-testid="offer-booking-error"
        >
          {wizard.error}
        </p>
      )}
      <div className="flex items-center gap-3">
        {wizard.step === 2 && (
          <button
            type="button"
            onClick={wizard.goBack}
            data-testid="offer-booking-back"
            className="flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:bg-black/5"
          >
            <ChevronLeft size={16} /> {dictText(dict, 'back_text', 'Back')}
          </button>
        )}
        {wizard.step === 1 ? (
          <button
            type="button"
            onClick={wizard.goToSummary}
            disabled={!wizard.step1Ready}
            data-testid="offer-booking-continue"
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold tracking-widest uppercase transition-all ${
              wizard.step1Ready
                ? 'cursor-pointer text-white hover:scale-102 active:scale-97'
                : 'cursor-not-allowed text-neutral-300'
            }`}
            style={
              wizard.step1Ready
                ? {
                    background: accentGrad,
                    boxShadow: `0 8px 20px ${accentColor}44`,
                  }
                : { background: '#f7f7fb' }
            }
          >
            {dictText(dict, 'continue_text', 'Continue')}
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={wizard.handleConfirm}
            disabled={wizard.isLoading}
            data-testid="offer-booking-confirm"
            className={`flex-1 rounded-xl py-3 text-base font-bold tracking-widest text-white uppercase transition-all ${
              wizard.isLoading
                ? 'cursor-wait opacity-70'
                : 'cursor-pointer hover:scale-102 active:scale-97'
            }`}
            style={{
              background: accentGrad,
              boxShadow: `0 8px 20px ${accentColor}44`,
            }}
          >
            {wizard.isAuth
              ? dictText(dict, 'confirm_booking_text', 'Confirm booking')
              : dictText(dict, 'sign_in_to_book_text', 'Sign in to book')}
          </button>
        )}
      </div>
    </div>
  );
};

export default OfferBookingFooter;
