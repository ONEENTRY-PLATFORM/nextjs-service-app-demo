'use client';

import type { JSX } from 'react';

import { BRAND_GRADIENT, CYAN, DARK, PINK } from '../constants';

/**
 * CalendarDayCell — a single day button in the month calendar.
 *
 * Rendered as a bare `<button>` so it stays a direct child of the
 * `FadeStaggerGroup` grid (the wrapper animates `ref.current.children`, so an
 * extra element would break the stagger). Today is tinted cyan, the pick is
 * filled with the brand gradient, past days are disabled and greyed.
 * @param   {object}      props            - Component properties
 * @param   {number}      props.day        - Day of the month
 * @param   {boolean}     props.isPast     - The day is before today (disabled)
 * @param   {boolean}     props.isToday    - The day is today
 * @param   {boolean}     props.isSelected - The day is the chosen one
 * @param   {() => void}  props.onSelect   - Pick this day
 * @returns {JSX.Element}                  Day button
 */
const CalendarDayCell = ({
  day,
  isPast,
  isToday,
  isSelected,
  onSelect,
}: {
  day: number;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
}): JSX.Element => (
  <button
    disabled={isPast}
    onClick={onSelect}
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
      color: isSelected ? '#fff' : isPast ? '#ccc' : isToday ? CYAN : DARK,
      fontWeight: isSelected || isToday ? 600 : 400,
      boxShadow: isSelected ? `0 0 12px ${PINK}55` : 'none',
    }}
  >
    {day}
  </button>
);

export default CalendarDayCell;
