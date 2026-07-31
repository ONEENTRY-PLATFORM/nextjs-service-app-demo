import type { JSX } from 'react';

import CloseButton from '@/components/shared/CloseButton';
import CurrencySymbol from '@/components/shared/CurrencySymbol';

import type { OfferBookingInfo } from '../types';
import OfferStepDots from './OfferStepDots';

/**
 * OfferBookingHeader — the accent-gradient header of the booking modal: the
 * close button, offer name, package price with the crossed-out original, the
 * bundled-service chips and the step indicator.
 * @param   {object}           props         - Component properties
 * @param   {OfferBookingInfo} props.offer   - The offer being booked
 * @param   {1 | 2}            props.step    - Current wizard step (drives the indicator)
 * @param   {() => void}       props.onClose - Animated close of the modal
 * @returns {JSX.Element}                    Modal header
 */
const OfferBookingHeader = ({
  offer,
  step,
  onClose,
}: {
  offer: OfferBookingInfo;
  step: 1 | 2;
  onClose: () => void;
}): JSX.Element => {
  return (
    <div
      className="relative px-7 pt-6 pb-5 text-white"
      style={{ background: offer.accentGrad }}
    >
      <CloseButton
        onClose={onClose}
        className="absolute top-4 right-4"
        testId="offer-booking-close"
      />

      <h2 className="mt-1 mb-3 text-[1.7rem] leading-tight font-light">
        {offer.name}
      </h2>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="flex items-baseline text-[1.6rem] font-bold">
          <CurrencySymbol currency={offer.currency} big />
          {offer.price}
        </span>
        {offer.original > 0 && (
          <span className="flex items-baseline text-sm line-through opacity-70">
            <CurrencySymbol currency={offer.currency} />
            {offer.original}
          </span>
        )}
      </div>

      {offer.services.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {offer.services.map((serviceTitle) => (
            <span
              key={serviceTitle}
              className="rounded-full px-2.5 py-1 text-sm"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              {serviceTitle}
            </span>
          ))}
        </div>
      )}

      <OfferStepDots step={step} />
    </div>
  );
};

export default OfferBookingHeader;
