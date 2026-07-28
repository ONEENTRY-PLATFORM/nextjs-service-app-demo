import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import type { BookingMaster } from '@/components/layout/booking-page/types';
import { dictText } from '@/components/utils/dictText';

import OfferMasterCard from './OfferMasterCard';

/**
 * OfferMasterList — the "2. Specialist" block of the modal's first step: the
 * specialists able to perform the package at the chosen salon, or the empty
 * state when the location has none.
 * @param   {object}               props          - Component properties
 * @param   {BookingMaster[]}      props.masters  - Specialists available for this salon + package
 * @param   {string}               props.activeId - Chosen specialist id (`''` = none)
 * @param   {string}               props.accent   - Accent colour of the offer
 * @param   {(id: string) => void} props.onSelect - Choose a specialist
 * @returns {JSX.Element}                         Specialist picker block
 */
const OfferMasterList = ({
  masters,
  activeId,
  accent,
  onSelect,
}: {
  masters: BookingMaster[];
  activeId: string;
  accent: string;
  onSelect: (id: string) => void;
}): JSX.Element => {
  const dict = useDict();

  return (
    <div>
      <p className="mb-2.5 text-xs font-black tracking-wider text-neutral-300 uppercase">
        2. {dictText(dict, 'specialist_text', 'Specialist')}
      </p>
      {masters.length === 0 ? (
        <p className="text-base text-neutral-300" data-testid="offer-no-masters">
          {dictText(
            dict,
            'offer_no_masters_text',
            'No specialists available for this location.',
          )}
        </p>
      ) : (
        <div className="space-y-2">
          {masters.map((master) => (
            <OfferMasterCard
              key={master.id}
              master={master}
              active={master.id === activeId}
              accent={accent}
              onSelect={() => onSelect(master.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferMasterList;
