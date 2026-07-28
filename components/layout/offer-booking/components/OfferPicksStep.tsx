import type { JSX } from 'react';

import type { BookingSalon } from '@/components/layout/booking-page/types';

import type { OfferBookingController } from '../hooks/useOfferBooking';
import OfferDateTimeBlock from './OfferDateTimeBlock';
import OfferMasterList from './OfferMasterList';
import OfferSalonSelect from './OfferSalonSelect';

/**
 * OfferPicksStep — the first step of the offer booking modal: the location
 * dropdown, the specialist list and the date & time block, stacked as in the
 * mock.
 * @param   {object}                 props        - Component properties
 * @param   {OfferBookingController} props.wizard - Modal controller
 * @param   {BookingSalon[]}         props.salons - Salons to offer
 * @param   {string}                 props.accent - Accent colour of the offer
 * @returns {JSX.Element}                         Picks step
 */
const OfferPicksStep = ({
  wizard,
  salons,
  accent,
}: {
  wizard: OfferBookingController;
  salons: BookingSalon[];
  accent: string;
}): JSX.Element => (
  <div className="space-y-5">
    <OfferSalonSelect
      salons={salons}
      selectedId={wizard.salonId}
      accent={accent}
      onSelect={wizard.selectSalon}
    />
    <OfferMasterList
      masters={wizard.availableMasters}
      activeId={wizard.masterId}
      accent={accent}
      onSelect={wizard.selectMaster}
    />
    <OfferDateTimeBlock wizard={wizard} accent={accent} />
  </div>
);

export default OfferPicksStep;
