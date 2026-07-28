import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import type { OfferSlotOption } from '../hooks/useOfferBooking';

/**
 * OfferSlotGrid — the 4-column time grid of the "3. Date & time" block. Slots
 * that no longer fit before closing or have already passed today are shown
 * disabled; a day the schedule leaves empty shows the wizard's "no times"
 * message instead of a bare gap.
 * @param   {object}                 props          - Component properties
 * @param   {OfferSlotOption[]}      props.options  - Time grid of the chosen day
 * @param   {string}                 props.selected - Chosen slot (`''` = none)
 * @param   {string}                 props.accent   - Accent colour of the offer
 * @param   {(time: string) => void} props.onSelect - Choose a slot
 * @returns {JSX.Element}                           Slot grid or the empty-day message
 */
const OfferSlotGrid = ({
  options,
  selected,
  accent,
  onSelect,
}: {
  options: OfferSlotOption[];
  selected: string;
  accent: string;
  onSelect: (time: string) => void;
}): JSX.Element => {
  const dict = useDict();

  if (options.length === 0) {
    return (
      <p className="text-base text-neutral-300" data-testid="offer-no-times">
        {dictText(
          dict,
          'booking_no_times_text',
          'No available times on this day. Please pick another date.',
        )}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map(({ time, disabled }) => {
        const active = time === selected;
        return (
          <button
            key={time}
            type="button"
            onClick={() => !disabled && onSelect(time)}
            disabled={disabled}
            data-testid="offer-time-slot"
            className={`rounded-lg py-2 text-sm font-semibold transition-all ${
              disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
            }`}
            style={{
              background: active ? `${accent}15` : '#f7f7fb',
              border: active ? `2px solid ${accent}` : '2px solid transparent',
              color: active ? accent : '#4c4d56',
            }}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
};

export default OfferSlotGrid;
