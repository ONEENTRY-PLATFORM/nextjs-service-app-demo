import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import OfferSwapAnimations from '../animations/OfferSwapAnimations';
import type { OfferBookingController } from '../hooks/useOfferBooking';
import OfferCalendar from './OfferCalendar';
import OfferDayChips from './OfferDayChips';
import OfferSlotGrid from './OfferSlotGrid';

/**
 * OfferDateTimeBlock — the "3. Date & time" block of the modal's first step:
 * the day chips over either the slot grid or the unfolded inline calendar
 * (they swap in place, as in the mock).
 * @param   {object}                 props        - Component properties
 * @param   {OfferBookingController} props.wizard - Modal controller
 * @param   {string}                 props.accent - Accent colour of the offer
 * @returns {JSX.Element}                         Date & time block
 */
const OfferDateTimeBlock = ({
  wizard,
  accent,
}: {
  wizard: OfferBookingController;
  accent: string;
}): JSX.Element => {
  const dict = useDict();

  return (
    <div>
      <p className="mb-2.5 text-xs font-black tracking-wider text-neutral-300 uppercase">
        3. {dictText(dict, 'booking_step_datetime_label', 'Date & Time')}
      </p>
      <OfferDayChips
        dateKey={wizard.dateKey}
        todayKey={wizard.todayKey}
        tomorrowKey={wizard.tomorrowKey}
        calOpen={wizard.calOpen}
        accent={accent}
        onPickDay={wizard.pickDay}
        onToggleCalendar={wizard.toggleCalendar}
      />
      <OfferSwapAnimations swapKey={wizard.calOpen ? 'cal' : 'slots'} dy={-6}>
        {wizard.calOpen ? (
          <OfferCalendar
            accent={accent}
            year={wizard.calYear}
            month={wizard.calMonth}
            selectedKey={wizard.dateKey}
            todayKey={wizard.todayKey}
            onMonth={wizard.changeCalMonth}
            onPick={wizard.pickDay}
          />
        ) : (
          <OfferSlotGrid
            options={wizard.slotOptions}
            selected={wizard.slot}
            accent={accent}
            onSelect={wizard.selectSlot}
          />
        )}
      </OfferSwapAnimations>
    </div>
  );
};

export default OfferDateTimeBlock;
