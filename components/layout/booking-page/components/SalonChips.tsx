import { MapPin } from 'lucide-react';
import type { JSX } from 'react';

import { MUTED } from '../constants';
import type { BookingSalon } from '../types';

/**
 * SalonChips — the full-width salon pill chips at the bottom of a specialist
 * card (mock salon chips block).
 * @param   {object}         props        - Component properties
 * @param   {BookingSalon[]} props.salons - Salons to list
 * @param   {number}         props.height - Chip height in px (38 mobile / 40 desktop)
 * @returns {JSX.Element}                 Chips column
 */
const SalonChips = ({
  salons,
  height,
}: {
  salons: BookingSalon[];
  height: number;
}): JSX.Element => (
  <>
    {salons.map((s) => (
      <div
        key={s.id}
        className="flex w-full items-center gap-2 rounded-full border px-4"
        style={{ borderColor: '#e8e8f0', background: '#fff', height }}
      >
        <MapPin size={14} color={MUTED} />
        <span className="truncate text-base font-semibold text-slate-400">
          {s.name}
        </span>
      </div>
    ))}
  </>
);

export default SalonChips;
