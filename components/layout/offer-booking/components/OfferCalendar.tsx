import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { DAYS, MONTHS } from '@/components/layout/booking-page/constants';
import daysInMonth from '@/components/layout/booking-page/utils/daysInMonth';
import firstDayOfMonth from '@/components/layout/booking-page/utils/firstDayOfMonth';
import { dictText } from '@/components/utils/dictText';

import { dateKeyToDate } from '../utils/dateKeyToDate';

/**
 * OfferCalendar — the compact inline month calendar of the modal's
 * "3. Date & time" block (mock `Calendar`): month pager, Mo–Su headers and a
 * 7-column day grid on the neutral panel. Days before today are disabled and
 * the pager cannot leave the current month backwards.
 * @param   {object}                                props            - Component properties
 * @param   {string}                                props.accent     - Accent colour of the offer
 * @param   {number}                                props.year       - Year shown
 * @param   {number}                                props.month      - Month index (0-based) shown
 * @param   {string}                                props.selectedKey - Chosen day key
 * @param   {string}                                props.todayKey   - Date key of today (the minimum pickable day)
 * @param   {(year: number, month: number) => void} props.onMonth    - Page the calendar
 * @param   {(key: string) => void}                 props.onPick     - Choose a day
 * @returns {JSX.Element}                                            Inline calendar
 */
const OfferCalendar = ({
  accent,
  year,
  month,
  selectedKey,
  todayKey,
  onMonth,
  onPick,
}: {
  accent: string;
  year: number;
  month: number;
  selectedKey: string;
  todayKey: string;
  onMonth: (year: number, month: number) => void;
  onPick: (key: string) => void;
}): JSX.Element => {
  const dict = useDict();
  const today = dateKeyToDate(todayKey);
  const lead = firstDayOfMonth(year, month);
  const total = daysInMonth(year, month);

  /** Grid cells: leading blanks, the days, then a tail padding to full weeks. */
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canPrev =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth());

  /**
   * Page one month back/forward, wrapping across year boundaries.
   * @param   {number} delta - `-1` or `1`
   * @returns {void}
   */
  const page = (delta: number): void => {
    const next = new Date(year, month + delta, 1);
    onMonth(next.getFullYear(), next.getMonth());
  };

  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: '#f7f7fb' }}
      data-testid="offer-calendar"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => canPrev && page(-1)}
          disabled={!canPrev}
          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={dictText(dict, 'previous_month_aria', 'Previous month')}
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-slate-400 capitalize">
          {MONTHS[month]} {year}
        </p>
        <button
          type="button"
          onClick={() => page(1)}
          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white"
          aria-label={dictText(dict, 'next_month_aria', 'Next month')}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-bold tracking-wider text-neutral-300 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) return <div key={index} />;
          const key = `${year}-${month}-${day}`;
          const disabled = new Date(year, month, day) < today;
          const selected = key === selectedKey;
          return (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && onPick(key)}
              disabled={disabled}
              data-testid="offer-calendar-day"
              className={`aspect-square rounded-lg text-sm font-semibold transition-all ${
                disabled
                  ? 'cursor-not-allowed'
                  : selected
                    ? 'cursor-pointer'
                    : 'cursor-pointer hover:bg-white'
              }`}
              style={{
                background: selected ? accent : 'transparent',
                color: disabled ? '#d0d0dc' : selected ? '#fff' : '#4c4d56',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OfferCalendar;
