'use client';

import { ChevronDown, MapPin } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import { DARK, MUTED, PINK } from './constants';
import type { ServicesSalon } from './types';

/**
 * SalonSelector — the studio filter of the services catalog: a row of cards on
 * desktop and a compact dropdown on mobile. Clicking the active studio again
 * clears the filter (`null` = All studios). Renders nothing without salons.
 * @param   {object}                       props          - Component properties
 * @param   {ServicesSalon[]}              props.salons   - Salon locations
 * @param   {string | null}                props.selected - Selected salon `pageUrl` (`null` = All)
 * @param   {(url: string | null) => void} props.onSelect - Change the selected salon
 * @returns {JSX.Element | null}                          Studio selector or `null`
 */
const SalonSelector = ({
  salons,
  selected,
  onSelect,
}: {
  salons: ServicesSalon[];
  selected: string | null;
  onSelect: (url: string | null) => void;
}): JSX.Element | null => {
  const dict = useDict();
  /** Mobile salon dropdown open state */
  const [salonOpen, setSalonOpen] = useState(false);

  if (salons.length === 0) {
    return null;
  }

  /** Selected salon entity for the mobile dropdown label */
  const activeSalon = salons.find((s) => s.url === selected);

  return (
    <>
      {/* Salon selector — DESKTOP: cards */}
      <div className="mb-8 hidden gap-3 md:grid md:grid-cols-3">
        {salons.map((s, index) => {
          const active = s.url === selected;
          return (
            <button
              key={s.url}
              onClick={() => onSelect(active ? null : s.url)}
              className={`rounded-xl px-4 py-3 text-left transition-all active:scale-97 ${
                active ? 'bg-gradient-brand' : 'bg-white'
              }`}
              style={{
                color: active ? '#fff' : DARK,
                boxShadow: active
                  ? `0 8px 24px ${PINK}33`
                  : '0 2px 10px rgba(0,0,0,0.05)',
                border: active
                  ? '1.5px solid transparent'
                  : '1.5px solid #e8e8f0',
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <MapPin size={14} />
                <span className="text-base font-bold">
                  {(dict?.studio_label_prefix?.value as string | undefined) ||
                    'Studio'}{' '}
                  {index + 1} — {s.title}
                </span>
              </div>
              {s.address && <p className="text-sm opacity-80">{s.address}</p>}
            </button>
          );
        })}
      </div>

      {/* Salon selector — MOBILE: compact dropdown */}
      <div className="relative mb-6 md:hidden">
        <button
          onClick={() => setSalonOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3"
          style={{
            border: '1.5px solid #e8e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          <span className="flex items-center gap-2 text-base font-semibold text-slate-400">
            <MapPin size={14} color={PINK} />
            {activeSalon
              ? `${(dict?.studio_label_prefix?.value as string | undefined) || 'Studio'} ${salons.indexOf(activeSalon) + 1} — ${activeSalon.title}`
              : (dict?.all_studios_text?.value as string | undefined) ||
                'All studios'}
          </span>
          <ChevronDown
            size={16}
            color={MUTED}
            style={{
              transform: salonOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}
          />
        </button>
        {salonOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setSalonOpen(false)}
            />
            <div
              className="absolute inset-x-0 z-20 mt-1 overflow-hidden rounded-xl bg-white"
              style={{
                border: '1.5px solid #e8e8f0',
                boxShadow: '0 12px 32px rgba(180,40,220,0.18)',
              }}
            >
              <button
                onClick={() => {
                  onSelect(null);
                  setSalonOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-base font-semibold"
                style={{
                  color: !selected ? PINK : DARK,
                  background: !selected ? `${PINK}0d` : 'transparent',
                }}
              >
                {(dict?.all_studios_text?.value as string | undefined) ||
                  'All studios'}
              </button>
              {salons.map((s, index) => {
                const active = s.url === selected;
                return (
                  <button
                    key={s.url}
                    onClick={() => {
                      onSelect(s.url);
                      setSalonOpen(false);
                    }}
                    className="w-full border-t px-4 py-3 text-left"
                    style={{
                      borderColor: '#f1f1f5',
                      background: active ? `${PINK}0d` : 'transparent',
                    }}
                  >
                    <span
                      className="block text-base font-semibold"
                      style={{ color: active ? PINK : DARK }}
                    >
                      {(dict?.salon_label_prefix?.value as
                        string | undefined) || 'Salon'}{' '}
                      {index + 1} — {s.title}
                    </span>
                    {s.address && (
                      <span className="block text-sm text-neutral-300">
                        {s.address}
                      </span>
                    )}
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

export default SalonSelector;
