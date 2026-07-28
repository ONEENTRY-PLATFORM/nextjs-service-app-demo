import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import CurrencySymbol from '@/components/shared/CurrencySymbol';
import { dictText } from '@/components/utils/dictText';

import type { OfferBookingController } from '../hooks/useOfferBooking';
import type { OfferBookingInfo } from '../types';
import { formatDateKeyLong } from '../utils/formatDateKeyLong';
import OfferSignInNote from './OfferSignInNote';
import OfferSummaryRow from './OfferSummaryRow';

/**
 * OfferSummaryStep — the second step of the offer booking modal: the summary
 * panel (location, specialist, when, the package with its price) and, for
 * signed-out clients, the sign-in note.
 * @param   {object}                 props        - Component properties
 * @param   {OfferBookingController} props.wizard - Modal controller
 * @param   {OfferBookingInfo}       props.offer  - The offer being booked
 * @returns {JSX.Element}                         Summary step
 */
const OfferSummaryStep = ({
  wizard,
  offer,
}: {
  wizard: OfferBookingController;
  offer: OfferBookingInfo;
}): JSX.Element => {
  const dict = useDict();

  return (
    <div className="space-y-5" data-testid="offer-booking-summary">
      <div className="rounded-2xl p-4" style={{ background: '#f7f7fb' }}>
        <p className="mb-2 text-xs font-black tracking-wider text-neutral-300 uppercase">
          {dictText(dict, 'offer_summary_text', 'Summary')}
        </p>
        <OfferSummaryRow
          label={dictText(dict, 'offer_booking_location_text', 'Location')}
          value={wizard.salonObj?.name ?? ''}
        />
        <OfferSummaryRow
          label={dictText(dict, 'specialist_text', 'Specialist')}
          value={wizard.masterObj?.name ?? ''}
        />
        <OfferSummaryRow
          label={dictText(dict, 'when_text', 'When')}
          value={`${formatDateKeyLong(wizard.dateKey)} · ${wizard.slot}`}
        />
        <OfferSummaryRow
          label={dictText(dict, 'offer_package_text', 'Package')}
          accent={offer.accentColor}
          value={
            <>
              {offer.name} ·{' '}
              <CurrencySymbol currency={offer.currency} />
              {offer.price}
            </>
          }
        />
      </div>

      {!wizard.isAuth && <OfferSignInNote accent={offer.accentColor} />}
    </div>
  );
};

export default OfferSummaryStep;
