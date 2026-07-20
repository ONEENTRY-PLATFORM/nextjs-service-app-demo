'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import {
  BRAND_GRADIENT,
  CYAN,
  DARK,
  DAYS,
  MONTHS,
  MUTED,
  PINK,
  TIMES,
} from '../constants';
import formatMinutes from '../formatMinutes';
import slotFits from '../slotFits';
import slotMinutes from '../slotMinutes';

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
 * brand gradient) and a grid of time slots below.
 *
 * Slots come from the chosen specialist's / salon's CMS schedule (`slots`,
 * expanded per day upstream). `hasSchedule` gates the fallback: with no CMS
 * schedule the static {@link TIMES} grid stands in (demo / unpopulated CMS);
 * with a schedule but no slots that day, the specialist simply does not work
 * then, so an explicit "no times" message shows instead of a misleading grid.
 *
 * Slots are also cut off at the end of the day by the length of the visit: the
 * whole appointment has to be served before closing, so a 90-minute booking in
 * a studio open until 22:00 cannot start later than 20:30.
 * @param   {object}              props                 - Component properties
 * @param   {string}              props.selectedDate    - Chosen date key `y-m-d` (`''` when none)
 * @param   {string}              props.selectedTime    - Chosen time `HH:MM` (`''` when none)
 * @param   {(d: string) => void} props.onDate          - Pick a date
 * @param   {(t: string) => void} props.onTime          - Pick a time
 * @param   {string[]}            props.slots           - `HH:MM` slots for the chosen day from the schedule
 * @param   {boolean}             props.hasSchedule     - Whether a CMS schedule drives the slots
 * @param   {number}              props.durationMinutes - Total length of the chosen services (`0` when none)
 * @param   {number|null}         props.closeMinutes    - Closing time in minutes since midnight (`null` when unknown)
 * @returns {JSX.Element}                               Date & time step
 */
const DateTimeStep = ({
  selectedDate,
  selectedTime,
  onDate,
  onTime,
  slots,
  hasSchedule,
  durationMinutes,
  closeMinutes,
}: {
  selectedDate: string;
  selectedTime: string;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
  slots: string[];
  hasSchedule: boolean;
  durationMinutes: number;
  closeMinutes: number | null;
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
  /**
   * Booked slots to strike through. Always empty for now: the public SDK only
   * returns the signed-in client's own orders, so other clients' bookings — the
   * real source of "busy" — are not readable here. Wired as a hook for when a
   * server-side availability endpoint exists.
   */
  const busyTimes: string[] = [];

  /** Schedule-driven slots when the CMS has a schedule; the static grid otherwise */
  const times = hasSchedule ? slots : TIMES;

  /** Starts the visit is too long for — the tail the length of the visit cuts off */
  const tooLate = times.filter(
    (t) => !slotFits(t, durationMinutes, closeMinutes),
  );

  /**
   * The day is open but the visit is too long for ANY of its starts — a struck
   * through grid alone would read as "fully booked", so it is replaced by an
   * explanation of what to do about it.
   */
  const noSlotFits = times.length > 0 && tooLate.length === times.length;

  /**
   * The length hint only earns its place when the length actually took slots
   * away; with the whole day still open it is noise, and when nothing fits the
   * message below says it all.
   */
  const showDurationHint = tooLate.length > 0 && !noSlotFits;

  /**
   * Minutes-since-midnight now, used to disable slots already past on the
   * current day. This is a single-timezone comparison on purpose: the studio and
   * its clients share one locale (Dubai), so the slot label, the schedule and
   * the browser clock are all the same wall-clock time — no timezone maths.
   * `-1` on any other day means "nothing is past".
   */
  const isTodaySelected = selectedDate === todayKey;
  const nowMinutes = isTodaySelected
    ? today.getHours() * 60 + today.getMinutes()
    : -1;

  return (
    <div className="space-y-5" data-testid="booking-step-datetime">
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
            data-testid="booking-cal-prev"
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
                data-testid="booking-day"
                data-day={day}
                data-past={isPast ? 'true' : 'false'}
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
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-medium" style={{ color: DARK }}>
              Available times
            </p>
            {showDurationHint && (
              <p
                className="text-xs"
                style={{ color: MUTED }}
                data-testid="booking-duration-hint"
              >
                Your visit takes {formatMinutes(durationMinutes)} — later starts
                are unavailable
              </p>
            )}
          </div>
          {times.length === 0 ? (
            <p
              className="rounded-xl p-4 text-sm"
              style={{ background: `${PINK}08`, color: MUTED }}
              data-testid="booking-no-slots"
            >
              No available times on this day. Please pick another date.
            </p>
          ) : noSlotFits ? (
            <p
              className="rounded-xl p-4 text-sm"
              style={{ background: `${PINK}08`, color: MUTED }}
              data-testid="booking-no-fitting-slots"
            >
              No start on this day leaves enough time for the whole{' '}
              {formatMinutes(durationMinutes)} visit before closing. Please pick
              another date or fewer services.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {times.map((t) => {
                /**
                 * Past on the current day, booked, or too late for the visit to
                 * end before closing — either way not pickable.
                 */
                const unavailable =
                  busyTimes.includes(t) ||
                  slotMinutes(t) <= nowMinutes ||
                  !slotFits(t, durationMinutes, closeMinutes);
                const active = selectedTime === t;
                return (
                  <button
                    key={t}
                    disabled={unavailable}
                    onClick={() => onTime(t)}
                    data-testid="booking-slot"
                    data-slot={t}
                    className="rounded-xl py-2 text-sm font-medium transition-all duration-150"
                    style={{
                      background: active
                        ? BRAND_GRADIENT
                        : unavailable
                          ? '#f7f7fb'
                          : `${PINK}10`,
                      color: active ? '#fff' : unavailable ? '#ccc' : PINK,
                      boxShadow: active ? `0 4px 12px ${PINK}44` : 'none',
                      textDecoration: unavailable ? 'line-through' : 'none',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimeStep;
