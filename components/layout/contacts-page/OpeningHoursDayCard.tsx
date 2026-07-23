import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import type { OpeningHoursRow } from '@/app/utils/parseOpeningTime';

/**
 * OpeningHoursDayCard — one weekday card of the contacts "Opening Hours" grid
 * (static-html mock `ContactsPage.tsx` → OpeningHours), highlighted with the
 * brand gradient and a "Today" badge when it is the current weekday.
 * @param   {object}          props         - Component properties
 * @param   {OpeningHoursRow} props.row     - Weekday name and its hours
 * @param   {boolean}         props.isToday - Whether the card is the current weekday
 * @returns {JSX.Element}                   Weekday card
 */
const OpeningHoursDayCard = ({
  row,
  isToday,
}: {
  row: OpeningHoursRow;
  isToday: boolean;
}): JSX.Element => {
  const dict = useDict();

  return (
    <div
      data-testid="opening-hours-day"
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-300 ${
        isToday
          ? 'scale-105 bg-gradient-brand'
          : 'border-[1.5px] border-slate-150 bg-white'
      }`}
      style={{
        boxShadow: isToday
          ? '0 8px 24px #ed21f144'
          : '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      <p
        className={`text-xs font-black tracking-wider uppercase ${
          isToday ? 'text-white/75' : 'text-neutral-300'
        }`}
      >
        {row.day.slice(0, 3)}
      </p>
      {/* `nowrap` collapses the injected newlines into spaces, so the hours
          render on one line — exactly like the mock's markup. */}
      <p
        className={`text-base leading-tight font-normal whitespace-nowrap ${
          isToday ? 'text-white' : 'text-slate-400'
        }`}
      >
        {row.hours.replace(' – ', '\n–\n')}
      </p>
      {isToday && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          {(dict?.today_text?.value as string | undefined) || 'Today'}
        </span>
      )}
    </div>
  );
};

export default OpeningHoursDayCard;
