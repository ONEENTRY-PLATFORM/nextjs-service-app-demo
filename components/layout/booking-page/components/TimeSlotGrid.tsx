'use client';

import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';
import formatMinutes from '@/components/utils/formatMinutes';

import FadeStaggerGroup from '../animations/FadeStaggerGroup';
import { MUTED, PINK, TIMES } from '../constants';
import slotFits from '../utils/slotFits';
import slotMinutes from '../utils/slotMinutes';
import TimeSlotButton from './TimeSlotButton';

/**
 * TimeSlotGrid — the "Available times" section under the calendar.
 *
 * Slots come from the chosen specialist's / salon's CMS schedule; `hasSchedule`
 * gates the fallback to the static {@link TIMES} grid (demo / unpopulated CMS).
 * The visit length trims the tail of the day (the whole appointment must finish
 * before closing); when nothing fits, or the day has no slots at all, an
 * explanatory message replaces the grid so a fully-struck grid never reads as
 * "fully booked".
 * @param   {object}              props                 - Component properties
 * @param   {Date}                props.today           - Now, for disabling past slots today
 * @param   {string}              props.todayKey        - `todayDateKey()`, the key of today
 * @param   {string}              props.selectedDate    - Chosen date key
 * @param   {string}              props.selectedTime    - Chosen time (`''` when none)
 * @param   {(t: string) => void} props.onTime          - Pick a time
 * @param   {string[]}            props.slots           - `HH:MM` slots for the chosen day
 * @param   {boolean}             props.hasSchedule     - Whether a CMS schedule drives the slots
 * @param   {number}              props.durationMinutes - Total length of the chosen services
 * @param   {number|null}         props.closeMinutes    - Closing time in minutes since midnight
 * @returns {JSX.Element}                               Times section
 */
const TimeSlotGrid = ({
  today,
  todayKey,
  selectedDate,
  selectedTime,
  onTime,
  slots,
  hasSchedule,
  durationMinutes,
  closeMinutes,
}: {
  today: Date;
  todayKey: string;
  selectedDate: string;
  selectedTime: string;
  onTime: (t: string) => void;
  slots: string[];
  hasSchedule: boolean;
  durationMinutes: number;
  closeMinutes: number | null;
}): JSX.Element => {
  const dict = useDict();

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
  const nowMinutes =
    selectedDate === todayKey ? today.getHours() * 60 + today.getMinutes() : -1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-sm font-medium text-slate-400">
          {dictText(dict, 'booking_available_times_text', 'Available times')}
        </p>
        {showDurationHint && (
          <p
            className="text-xs text-neutral-300"
            data-testid="booking-duration-hint"
          >
            {dictText(
              dict,
              'booking_visit_hint',
              'Your visit takes %d% — later starts are unavailable',
            ).replace('%d%', formatMinutes(durationMinutes))}
          </p>
        )}
      </div>
      {times.length === 0 ? (
        <p
          className="rounded-xl p-4 text-sm"
          style={{ background: `${PINK}08`, color: MUTED }}
          data-testid="booking-no-slots"
        >
          {dictText(
            dict,
            'booking_no_times_text',
            'No available times on this day. Please pick another date.',
          )}
        </p>
      ) : noSlotFits ? (
        <p
          className="rounded-xl p-4 text-sm"
          style={{ background: `${PINK}08`, color: MUTED }}
          data-testid="booking-no-fitting-slots"
        >
          {dictText(
            dict,
            'booking_no_fitting_slots_text',
            'No start on this day leaves enough time for the whole %d% visit before closing. Please pick another date or fewer services.',
          ).replace('%d%', formatMinutes(durationMinutes))}
        </p>
      ) : (
        <FadeStaggerGroup
          className="grid grid-cols-4 gap-2"
          groupKey={selectedDate}
          stagger={0.055}
        >
          {times.map((t) => (
            <TimeSlotButton
              key={t}
              time={t}
              active={selectedTime === t}
              /* Past on the current day, booked, or too late for the visit to
                 end before closing — either way not pickable. */
              unavailable={
                busyTimes.includes(t) ||
                slotMinutes(t) <= nowMinutes ||
                !slotFits(t, durationMinutes, closeMinutes)
              }
              onSelect={() => onTime(t)}
            />
          ))}
        </FadeStaggerGroup>
      )}
    </div>
  );
};

export default TimeSlotGrid;
