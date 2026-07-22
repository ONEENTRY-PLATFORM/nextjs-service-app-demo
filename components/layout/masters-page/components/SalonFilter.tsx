'use client';

import { ChevronDown, MapPin } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import type { SalonOption } from '../taxonomy';

/**
 * SalonFilter — the studio filter of the specialists page: three edge-to-edge
 * cards on desktop and a compact dropdown on mobile. Clicking the active
 * studio again clears the filter (`null` = All studios). Renders nothing
 * without salons.
 * @param   {object}                      props            - Component properties
 * @param   {SalonOption[]}               props.salons     - Salon filter options
 * @param   {number | null}               props.selectedId - Selected salon page id (`null` = All)
 * @param   {(id: number | null) => void} props.onSelect   - Change the selected salon
 * @returns {JSX.Element | null}                           Studio filter or `null`
 */
const SalonFilter = ({
  salons,
  selectedId,
  onSelect,
}: {
  salons: SalonOption[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}): JSX.Element | null => {
  /** Mobile salon dropdown open state */
  const [salonOpen, setSalonOpen] = useState(false);

  if (salons.length === 0) {
    return null;
  }

  const selectedSalon = salons.find((s) => s.id === selectedId);

  return (
    <>
      {/* Salon filter — DESKTOP: edge-to-edge cards */}
      <div className="mb-6 hidden gap-3 lg:grid lg:grid-cols-3">
        {salons.map((salon, idx) => {
          const active = selectedId === salon.id;
          return (
            <button
              key={salon.id}
              onClick={() => onSelect(active ? null : salon.id)}
              className={`rounded-xl px-4 py-3 text-left transition-all active:scale-95 ${
                active
                  ? 'bg-gradient-brand text-white'
                  : 'border-[1.5px] border-slate-150 bg-white text-slate-400'
              }`}
              style={{
                boxShadow: active
                  ? '0 8px 24px #ed21f133'
                  : '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <MapPin size={14} className="shrink-0" />
                <span className="text-base font-bold">
                  Salon {idx + 1} — {salon.name}
                </span>
              </div>
              <p className="text-sm opacity-80">{salon.address}</p>
            </button>
          );
        })}
      </div>

      {/* Salon filter — MOBILE: compact dropdown */}
      <div className="relative mb-4 lg:hidden">
        <button
          onClick={() => setSalonOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-xl border-[1.5px] border-slate-150 bg-white px-4 py-3 shadow-sm"
        >
          <span className="flex items-center gap-2 text-base font-semibold text-slate-400">
            <MapPin size={14} className="shrink-0 text-accent-pink" />
            {selectedSalon
              ? `Salon ${salons.indexOf(selectedSalon) + 1} — ${selectedSalon.name}`
              : 'All studios'}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-neutral-300 transition-transform duration-200 ${
              salonOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {salonOpen && (
          <>
            {/* Click-away overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setSalonOpen(false)}
            />
            <div
              className="absolute inset-x-0 z-20 mt-1 overflow-hidden rounded-xl border-[1.5px] border-slate-150 bg-white"
              style={{ boxShadow: '0 12px 32px rgba(180,40,220,0.18)' }}
            >
              <button
                onClick={() => {
                  onSelect(null);
                  setSalonOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-base font-semibold ${
                  selectedId === null
                    ? 'bg-fuchsia-500/5 text-accent-pink'
                    : 'text-slate-400'
                }`}
              >
                All studios
              </button>
              {salons.map((salon, idx) => {
                const active = selectedId === salon.id;
                return (
                  <button
                    key={salon.id}
                    onClick={() => {
                      onSelect(salon.id);
                      setSalonOpen(false);
                    }}
                    className={`w-full border-t border-slate-150 px-4 py-3 text-left ${
                      active ? 'bg-fuchsia-500/5' : ''
                    }`}
                  >
                    <span
                      className={`block text-base font-semibold ${
                        active ? 'text-accent-pink' : 'text-slate-400'
                      }`}
                    >
                      Salon {idx + 1} — {salon.name}
                    </span>
                    <span className="block text-sm text-neutral-300">
                      {salon.address}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SalonFilter;
