'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import FadeStaggerGroup from '../animations/FadeStaggerGroup';
import { DAYS, MONTHS, MUTED } from '../constants';
import daysInMonth from '../utils/daysInMonth';
import firstDayOfMonth from '../utils/firstDayOfMonth';
import CalendarDayCell from './CalendarDayCell';

/**
 * MonthCalendar — the month calendar card of the Date & Time step: a month
 * header with prev/next navigation, the Mo–Su weekday row and the day grid
 * (past days disabled, today tinted, the pick gradient-filled). Owns its own
 * `view` (year/month); the chosen date and the pick handler come from above.
 * @param   {object}              props              - Component properties
 * @param   {Date}                props.today        - Now, for the past/today comparison
 * @param   {string}              props.todayKey     - `todayDateKey()`, the key of today
 * @param   {string}              props.selectedDate - Chosen date key (`''` when none)
 * @param   {(d: string) => void} props.onDate       - Pick a date
 * @returns {JSX.Element}                            Calendar card
 */
const MonthCalendar = ({
  today,
  todayKey,
  selectedDate,
  onDate,
}: {
  today: Date;
  todayKey: string;
  selectedDate: string;
  onDate: (d: string) => void;
}): JSX.Element => {
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const { year, month } = view;
  const firstDay = firstDayOfMonth(year, month);
  const daysCount = daysInMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);

  /** Midnight today, so a whole-day comparison marks past days disabled */
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() =>
            setView((v) => {
              const m = v.month - 1 < 0 ? 11 : v.month - 1;
              const y = v.month - 1 < 0 ? v.year - 1 : v.year;
              return { year: y, month: m };
            })
          }
          data-testid="booking-cal-prev"
          className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft size={18} color={MUTED} />
        </button>
        <span className="font-semibold text-fuchsia-500">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() =>
            setView((v) => {
              const m = v.month + 1 > 11 ? 0 : v.month + 1;
              const y = v.month + 1 > 11 ? v.year + 1 : v.year;
              return { year: y, month: m };
            })
          }
          data-testid="booking-cal-next"
          className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
        >
          <ChevronRight size={18} color={MUTED} />
        </button>
      </div>
      <div className="mb-2 grid grid-cols-7">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-xs font-medium text-fuchsia-500"
          >
            {d}
          </div>
        ))}
      </div>
      <FadeStaggerGroup
        className="grid grid-cols-7 gap-y-1"
        groupKey={`${year}-${month}`}
        stagger={0.022}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const key = `${year}-${month}-${day}`;
          return (
            <CalendarDayCell
              key={key}
              day={day}
              isPast={new Date(year, month, day) < startOfToday}
              isToday={key === todayKey}
              isSelected={selectedDate === key}
              onSelect={() => onDate(key)}
            />
          );
        })}
      </FadeStaggerGroup>
    </div>
  );
};

export default MonthCalendar;
