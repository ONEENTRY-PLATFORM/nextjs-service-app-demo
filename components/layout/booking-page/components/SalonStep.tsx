'use client';

import { Check, MapPin } from 'lucide-react';
import type { JSX } from 'react';

import { MUTED, PINK } from '../constants';
import type { BookingSalon } from '../types';

/**
 * SalonStep — the studio selection step of the booking wizard, ported from
 * the static-html mock (`BookingPage.tsx` → `SalonStep`): a vertical list of
 * salon rows with a map-pin icon, name, address · phone line and a radio
 * circle on the right.
 * @param   {object}               props          - Component properties
 * @param   {BookingSalon[]}       props.salons   - Salons available for the selection
 * @param   {number | null}        props.selected - Page id of the chosen salon (`''` when none)
 * @param   {(id: number) => void} props.onSelect - Select a salon by page id
 * @returns {JSX.Element}                         Salon step
 */
const SalonStep = ({
  salons,
  selected,
  onSelect,
}: {
  salons: BookingSalon[];
  selected: number | null;
  onSelect: (id: number) => void;
}): JSX.Element => {
  return (
    <div className="space-y-3" data-testid="booking-step-salon">
      <h3 className="text-lg font-light text-slate-400">Choose your studio</h3>
      <div className="grid gap-3">
        {salons.map((s) => {
          const active = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              data-testid="booking-salon-option"
              data-salon-id={s.id}
              className="flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:scale-101 active:scale-99"
              style={{
                borderColor: active ? PINK : '#e8e8f0',
                background: active ? `${PINK}08` : '#fff',
                boxShadow: active
                  ? `0 0 0 3px ${PINK}22`
                  : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: active ? `${PINK}22` : '#f7f7fb' }}
              >
                <MapPin size={18} color={active ? PINK : MUTED} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-400">{s.name}</p>
                <p className="text-base text-neutral-300">
                  {[s.address, s.phone].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div
                className="flex size-5 items-center justify-center rounded-full border-2 transition-all"
                style={{
                  borderColor: active ? PINK : '#d0d0dc',
                  background: active ? PINK : 'transparent',
                }}
              >
                {active && <Check size={16} color="#fff" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SalonStep;
