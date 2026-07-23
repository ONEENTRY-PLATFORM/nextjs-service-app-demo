'use client';

import type { JSX } from 'react';

import { BRAND_GRADIENT, PINK } from '../constants';

/**
 * TimeSlotButton — a single `HH:MM` slot in the time grid.
 *
 * Rendered as a bare `<button>` so it stays a direct child of the
 * `FadeStaggerGroup` grid. Unavailable slots (past, booked, or too late for the
 * visit to end before closing) are struck through and disabled; the pick is
 * filled with the brand gradient.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.time        - Slot label `HH:MM`
 * @param   {boolean}     props.active      - The slot is the chosen one
 * @param   {boolean}     props.unavailable - The slot cannot be picked
 * @param   {() => void}  props.onSelect    - Pick this slot
 * @returns {JSX.Element}                   Slot button
 */
const TimeSlotButton = ({
  time,
  active,
  unavailable,
  onSelect,
}: {
  time: string;
  active: boolean;
  unavailable: boolean;
  onSelect: () => void;
}): JSX.Element => (
  <button
    disabled={unavailable}
    onClick={onSelect}
    data-testid="booking-slot"
    data-slot={time}
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
    {time}
  </button>
);

export default TimeSlotButton;
