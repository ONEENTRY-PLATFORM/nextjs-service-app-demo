import { ChevronDown, MapPin } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import { DARK, MUTED, PINK } from '../constants';
import type { ReviewSalon } from '../data';

/**
 * SalonFilter — the salon selector: a dropdown on mobile / small tablet and a three-column
 * grid of cards on desktop. The active salon uses the PINK brand gradient;
 * clicking the active desktop card clears the filter (back to all studios).
 * @param   {object}                  props          - Component properties
 * @param   {ReviewSalon[]}           props.salons   - Salon locations
 * @param   {string|null}             props.salonId  - Active salon id (`null` = all studios)
 * @param   {(id: string|null)=>void} props.onSelect - Select a salon (or `null` for all)
 * @returns {JSX.Element}                            Salon filter
 */
const SalonFilter = ({
  salons,
  salonId,
  onSelect,
}: {
  salons: ReviewSalon[];
  salonId: string | null;
  onSelect: (id: string | null) => void;
}): JSX.Element => {
  const dict = useDict();
  const [open, setOpen] = useState(false);

  const activeIndex = salons.findIndex((s) => s.id === salonId);
  const activeSalon = activeIndex >= 0 ? salons[activeIndex] : undefined;

  return (
    <div className="pt-6 pb-2">
      {/* Mobile + small tablet: dropdown selector */}
      <div className="relative lg:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border-[1.5px] border-slate-150 bg-white px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
        >
          <span className="flex min-w-0 items-center gap-2 text-base font-semibold text-slate-400">
            <MapPin size={14} color={PINK} className="shrink-0" />
            <span className="truncate">
              {activeSalon
                ? `${dictText(dict, 'salon_label_prefix', 'Salon')} ${activeIndex + 1} — ${activeSalon.name}`
                : dictText(dict, 'all_studios_text', 'All studios')}
            </span>
          </span>
          <ChevronDown
            size={16}
            color={MUTED}
            className="shrink-0 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 z-20 mt-1 overflow-hidden rounded-xl border-[1.5px] border-slate-150 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
              <button
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-base font-semibold"
                style={{
                  color: !salonId ? PINK : DARK,
                  background: !salonId ? `${PINK}0d` : 'transparent',
                }}
              >
                {dictText(dict, 'all_studios_text', 'All studios')}
              </button>
              {salons.map((s, idx) => {
                const active = s.id === salonId;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelect(s.id);
                      setOpen(false);
                    }}
                    className="w-full border-t border-slate-100 px-4 py-3 text-left"
                    style={{ background: active ? `${PINK}0d` : 'transparent' }}
                  >
                    <span
                      className="block text-base font-semibold"
                      style={{ color: active ? PINK : DARK }}
                    >
                      {dictText(dict, 'salon_label_prefix', 'Salon')} {idx + 1}{' '}
                      — {s.name}
                    </span>
                    <span className="block text-sm text-neutral-300">
                      {s.address}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Desktop (incl. iPad Pro): salon cards */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-3">
        {salons.map((s, idx) => {
          const active = salonId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(active ? null : s.id)}
              className={`rounded-xl px-4 py-3 text-left transition-transform active:scale-97 ${
                active
                  ? 'bg-gradient-brand text-white'
                  : 'border-[1.5px] border-slate-150 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
              }`}
              style={
                active ? { boxShadow: `0 8px 24px ${PINK}33` } : { color: DARK }
              }
            >
              <div className="mb-1 flex items-center gap-2">
                <MapPin size={14} />
                <span className="text-base font-bold">
                  {dictText(dict, 'salon_label_prefix', 'Salon')} {idx + 1} —{' '}
                  {s.name}
                </span>
              </div>
              <p className="text-base opacity-80">{s.address}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SalonFilter;
