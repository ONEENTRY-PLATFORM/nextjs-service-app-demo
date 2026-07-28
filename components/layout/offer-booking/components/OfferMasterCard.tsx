import { Star } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import Portrait from '@/components/layout/booking-page/components/Portrait';
import type { BookingMaster } from '@/components/layout/booking-page/types';
import { dictText } from '@/components/utils/dictText';

import { masterNextSlot } from '../utils/masterNextSlot';

/**
 * OfferMasterCard — one specialist row of the modal's "2. Specialist" list:
 * round portrait, name with the grade chip, the specialties line, and the
 * rating with the nearest free slot on the right. The active row is tinted
 * and outlined with the offer's accent.
 * @param   {object}        props          - Component properties
 * @param   {BookingMaster} props.master   - Specialist to render
 * @param   {boolean}       props.active   - This row is the current pick
 * @param   {string}        props.accent   - Accent colour of the offer
 * @param   {() => void}    props.onSelect - Choose this specialist
 * @returns {JSX.Element}                  Specialist row
 */
const OfferMasterCard = ({
  master: m,
  active,
  accent,
  onSelect,
}: {
  master: BookingMaster;
  active: boolean;
  accent: string;
  onSelect: () => void;
}): JSX.Element => {
  const dict = useDict();
  const nextSlot = masterNextSlot(m);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      data-testid="offer-master-option"
      data-master-id={m.id}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all"
      style={{
        background: active ? `${accent}15` : '#f7f7fb',
        border: active ? `2px solid ${accent}` : '2px solid transparent',
      }}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
        <Portrait
          photo={m.photo}
          alt={m.name}
          sizes="44px"
          blur={m.photoBlur}
          className="object-cover object-top"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-base font-bold text-slate-400">
            {m.name}
          </p>
          {m.grade && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
              style={{ background: '#ece3d4', color: '#8a7a5c' }}
            >
              {m.grade}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-neutral-300">
          {m.specialties.join(' · ')}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="flex items-center justify-end gap-0.5 text-sm text-slate-400">
          <Star size={15} fill={accent} stroke={accent} /> {m.rating.toFixed(1)}
        </p>
        {nextSlot && (
          <p className="text-sm text-neutral-300">
            {dictText(dict, 'offer_next_slot_text', 'next %t%').replace(
              '%t%',
              nextSlot,
            )}
          </p>
        )}
      </div>
    </button>
  );
};

export default OfferMasterCard;
