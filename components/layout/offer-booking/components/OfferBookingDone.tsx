import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

/**
 * OfferBookingDone — the confirmation screen of the modal (mock `done`
 * state): a gradient check circle over the "Booking confirmed!" line. It
 * holds for a beat and the modal then closes on its own, routing a real
 * appointment to the profile.
 * @param   {object}      props            - Component properties
 * @param   {string}      props.accentGrad - Accent gradient of the offer
 * @returns {JSX.Element}                  Confirmation screen
 */
const OfferBookingDone = ({
  accentGrad,
}: {
  accentGrad: string;
}): JSX.Element => {
  const dict = useDict();

  return (
    <div
      className="flex flex-col items-center justify-center py-8"
      data-testid="offer-booking-done"
    >
      <div
        className="mb-4 flex size-16 items-center justify-center rounded-full"
        style={{ background: accentGrad }}
      >
        <Check size={32} color="#fff" />
      </div>
      <p className="text-lg font-bold text-slate-400">
        {dictText(dict, 'booking_confirmed_title', 'Booking confirmed!')}
      </p>
      <p className="mt-1 text-base text-neutral-300">
        {dictText(
          dict,
          'booking_confirmed_desc',
          "We'll send the details to you shortly.",
        )}
      </p>
    </div>
  );
};

export default OfferBookingDone;
