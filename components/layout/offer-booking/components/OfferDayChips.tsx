import { Calendar as CalendarIcon } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import { formatDateKeyChip } from '../utils/formatDateKeyChip';
import OfferDayChip from './OfferDayChip';

/**
 * OfferDayChips — the day row of the "3. Date & time" block: Today, Tomorrow
 * and the calendar toggle, which doubles as the chip of a custom-picked date.
 * While the calendar is unfolded the toggle chip reads active instead of the
 * day chips, exactly as the mock behaves.
 * @param   {object}               props                - Component properties
 * @param   {string}               props.dateKey        - Chosen day
 * @param   {string}               props.todayKey       - Date key of today
 * @param   {string}               props.tomorrowKey    - Date key of tomorrow
 * @param   {boolean}              props.calOpen        - Whether the calendar is unfolded
 * @param   {string}               props.accent         - Accent colour of the offer
 * @param   {(key: string) => void} props.onPickDay     - Choose today / tomorrow
 * @param   {() => void}           props.onToggleCalendar - Unfold / fold the calendar
 * @returns {JSX.Element}                               Day chip row
 */
const OfferDayChips = ({
  dateKey,
  todayKey,
  tomorrowKey,
  calOpen,
  accent,
  onPickDay,
  onToggleCalendar,
}: {
  dateKey: string;
  todayKey: string;
  tomorrowKey: string;
  calOpen: boolean;
  accent: string;
  onPickDay: (key: string) => void;
  onToggleCalendar: () => void;
}): JSX.Element => {
  const dict = useDict();
  const isCustom = dateKey !== todayKey && dateKey !== tomorrowKey;

  return (
    <div className="mb-3 flex gap-2">
      <OfferDayChip
        active={dateKey === todayKey && !calOpen}
        accent={accent}
        label={dictText(dict, 'today_text', 'Today')}
        onClick={() => onPickDay(todayKey)}
      />
      <OfferDayChip
        active={dateKey === tomorrowKey && !calOpen}
        accent={accent}
        label={dictText(dict, 'tomorrow_text', 'Tomorrow')}
        onClick={() => onPickDay(tomorrowKey)}
      />
      <OfferDayChip
        active={isCustom || calOpen}
        accent={accent}
        icon={<CalendarIcon size={17} />}
        label={
          isCustom
            ? formatDateKeyChip(dateKey)
            : dictText(dict, 'pick_date_text', 'Pick date')
        }
        onClick={onToggleCalendar}
      />
    </div>
  );
};

export default OfferDayChips;
