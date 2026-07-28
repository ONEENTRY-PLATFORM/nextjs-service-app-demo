import type { JSX, ReactNode } from 'react';

/**
 * OfferDayChip — one chip of the modal's day row (Today / Tomorrow / the
 * calendar toggle): accent-filled when active, neutral otherwise.
 * @param   {object}      props         - Component properties
 * @param   {boolean}     props.active  - This chip is the current pick
 * @param   {string}      props.accent  - Accent colour of the offer
 * @param   {string}      props.label   - Chip label
 * @param   {ReactNode}   [props.icon]  - Leading icon (the calendar chip)
 * @param   {() => void}  props.onClick - Chip action
 * @returns {JSX.Element}               Day chip
 */
const OfferDayChip = ({
  active,
  accent,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  accent: string;
  label: string;
  icon?: ReactNode | undefined;
  onClick: () => void;
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    data-testid="offer-day-chip"
    aria-pressed={active}
    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold tracking-wider uppercase transition-all"
    style={{
      background: active ? accent : '#f7f7fb',
      color: active ? '#fff' : '#a8a9b5',
    }}
  >
    {icon}
    <span className="truncate">{label}</span>
  </button>
);

export default OfferDayChip;
