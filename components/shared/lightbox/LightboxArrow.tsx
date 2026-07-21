'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CSSProperties, JSX } from 'react';

/**
 * LightboxArrow — one of the two paging arrows pinned to the sides of a
 * fullscreen viewer. Position and ring styling stay with the caller, since the
 * gallery, portfolio and salon viewers each place and border theirs
 * differently.
 * @param   {object}          props           - Component properties
 * @param   {('prev'|'next')} props.side      - Which arrow this is (picks the chevron)
 * @param   {() => void}      props.onClick   - Page in that direction
 * @param   {string}          props.label     - `aria-label` of the button
 * @param   {string}          props.className - Positioning and transition classes
 * @param   {CSSProperties}   props.style     - Ring / background styling
 * @returns {JSX.Element}                     Arrow button
 */
const LightboxArrow = ({
  side,
  onClick,
  label,
  className,
  style,
}: {
  side: 'prev' | 'next';
  onClick: () => void;
  label: string;
  className: string;
  style: CSSProperties;
}): JSX.Element => {
  const Chevron = side === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`absolute z-10 flex size-12 items-center justify-center rounded-full ${className}`}
      style={style}
    >
      <Chevron size={22} color="#fff" />
    </button>
  );
};

export default LightboxArrow;
