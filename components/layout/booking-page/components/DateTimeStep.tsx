'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import {
  BRAND_GRADIENT,
  CYAN,
  DARK,
  DAYS,
  DEMO_BUSY_TIMES,
  MONTHS,
  MUTED,
  PINK,
  TIMES,
} from '../constants';

/**
 * Days in a month.
 * @param   {number} y - Full year
 * @param   {number} m - Month index (0–11)
 * @returns {number}   Day count
 */
const getDaysInMonth = (y: number, m: number): number =>
  new Date(y, m + 1, 0).getDate();

/**
 * Weekday index of the 1st of a month, Monday-based (0 = Monday).
 * @param   {number} y - Full year
 * @param   {number} m - Month index (0–11)
 * @returns {number}   Weekday index
 */
const getFirstDayOfMonth = (y: number, m: number): number => {
  const d = new Date(y, m, 1).getDay();
  return (d + 6) % 7;
};

/**
 * DateTimeStep — the date & time step of the booking wizard, ported from the
 * static-html mock (`BookingPage.tsx` → `DateTimeStep`): a month calendar
 * (past days disabled, today highlighted cyan, the pick filled with the
 * brand gradient) and a grid of time slots below. In demo mode a few slots
 * are struck through as busy, matching the mock.
 * @param   {object}              props              - Component properties
 * @param   {string}              props.selectedDate - Chosen date key `y-m-d` (`''` when none)
 * @param   {string}              props.selectedTime - Chosen time `HH:MM` (`''` when none)
 * @param   {(d: string) => void} props.onDate       - Pick a date
 * @param   {(t: string) => void} props.onTime       - Pick a time
 * @param   {boolean}             props.demo         - Demo mode (adds mock busy slots)
 * @returns {JSX.Element}                            Date & time step
 */
const DateTimeStep = ({
  selectedDate,
  selectedTime,
  onDate,
  onTime,
  demo,
}: {
  selectedDate: string;
  selectedTime: string;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
  demo: boolean;
}): JSX.Element => {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const { year, month } = view;
  const firstDay = getFirstDayOfMonth(year, month);
  const daysCount = getDaysInMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const busyTimes = demo ? DEMO_BUSY_TIMES : [];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-light" style={{ color: DARK }}>
        Pick date &amp; time
      </h3>
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
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft size={18} color={MUTED} />
          </button>
          <span className="font-semibold" style={{ color: PINK }}>
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
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          >
            <ChevronRight size={18} color={MUTED} />
          </button>
        </div>
        <div className="mb-2 grid grid-cols-7">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium"
              style={{ color: PINK }}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const key = `${year}-${month}-${day}`;
            const isPast =
              new Date(year, month, day) <
              new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = key === todayKey;
            const isSelected = selectedDate === key;
            return (
              <button
                key={key}
                disabled={isPast}
                onClick={() => onDate(key)}
                className="relative mx-auto flex size-8 items-center justify-center rounded-lg text-sm transition-all duration-150"
                style={{
                  background: isSelected
                    ? BRAND_GRADIENT
                    : isToday
                      ? `${CYAN}22`
                      : 'transparent',
                  color: isSelected
                    ? '#fff'
                    : isPast
                      ? '#ccc'
                      : isToday
                        ? CYAN
                        : DARK,
                  fontWeight: isSelected || isToday ? 600 : 400,
                  boxShadow: isSelected ? `0 0 12px ${PINK}55` : 'none',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <p className="text-sm font-medium" style={{ color: DARK }}>
            Available times
          </p>
          <div className="grid grid-cols-4 gap-2">
            {TIMES.map((t) => {
              const busy = busyTimes.includes(t);
              const active = selectedTime === t;
              return (
                <button
                  key={t}
                  disabled={busy}
                  onClick={() => onTime(t)}
                  className="rounded-xl py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    background: active
                      ? BRAND_GRADIENT
                      : busy
                        ? '#f7f7fb'
                        : `${PINK}10`,
                    color: active ? '#fff' : busy ? '#ccc' : PINK,
                    boxShadow: active ? `0 4px 12px ${PINK}44` : 'none',
                    textDecoration: busy ? 'line-through' : 'none',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeStep;
