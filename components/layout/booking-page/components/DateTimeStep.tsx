'use client';

import type { JSX } from 'react';

import todayDateKey from '../utils/todayDateKey';
import MonthCalendar from './MonthCalendar';
import TimeSlotGrid from './TimeSlotGrid';

/**
 * DateTimeStep — the date & time step of the booking wizard, ported from the
 * static-html mock (`BookingPage.tsx` → `DateTimeStep`): a month calendar
 * ({@link MonthCalendar}) and, once a day is picked, its grid of time slots
 * ({@link TimeSlotGrid}). Both read "now" from the single `today` computed here
 * so the calendar's past/today marks and the time grid's past-slot cut-off
 * agree.
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
  const todayKey = todayDateKey();

  return (
    <div className="space-y-5" data-testid="booking-step-datetime">
      <h3 className="text-lg font-light text-slate-400">
        Pick date &amp; time
      </h3>
      <MonthCalendar
        today={today}
        todayKey={todayKey}
        selectedDate={selectedDate}
        onDate={onDate}
      />
      {selectedDate && (
        <TimeSlotGrid
          today={today}
          todayKey={todayKey}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onTime={onTime}
          slots={slots}
          hasSchedule={hasSchedule}
          durationMinutes={durationMinutes}
          closeMinutes={closeMinutes}
        />
      )}
    </div>
  );
};

export default DateTimeStep;
