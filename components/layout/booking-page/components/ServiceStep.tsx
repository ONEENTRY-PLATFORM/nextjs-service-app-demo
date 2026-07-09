'use client';

import { Check, Clock } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

import { CATEGORY_ORDER, DARK, MUTED, PINK } from '../constants';
import type { BookingService } from '../types';
import CategoryPills from './CategoryPills';
import Price from './Price';

/**
 * ServiceStep — the service selection step of the booking wizard, ported
 * from the static-html mock (`BookingPage.tsx` → `ServiceStep`): category
 * pills over a list of service rows (name, duration with a clock icon, price
 * and a radio circle). Only the categories the passed services actually
 * cover get a pill; a single category drops the "All" pill.
 * @param   {object}               props          - Component properties
 * @param   {BookingService[]}     props.services - Services available for the selection
 * @param   {string}               props.selected - Id of the chosen service (`''` when none)
 * @param   {(id: string) => void} props.onSelect - Select a service by id
 * @returns {JSX.Element}                         Service step
 */
const ServiceStep = ({
  services,
  selected,
  onSelect,
}: {
  services: BookingService[];
  selected: string;
  onSelect: (id: string) => void;
}): JSX.Element => {
  /** Category pills the available services actually cover, canonical order */
  const availableCats = useMemo(() => {
    const present = new Set(services.map((s) => s.category));
    const ordered = [
      ...CATEGORY_ORDER.filter((c) => present.has(c)),
      ...[...present].filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    return ordered.length <= 1 ? ordered : ['All', ...ordered];
  }, [services]);

  const [cat, setCat] = useState(availableCats[0] ?? 'All');

  // Reset the active pill if the offerings no longer include it (render
  // adjustment — the React "adjust state on prop change" pattern).
  if (!availableCats.includes(cat)) {
    setCat(availableCats[0] ?? 'All');
  }

  const filtered = services.filter((s) => cat === 'All' || s.category === cat);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-light" style={{ color: DARK }}>
        Choose a service
      </h3>
      <CategoryPills
        categories={availableCats}
        active={cat}
        onChange={setCat}
      />
      <div className="-mx-1 max-h-115 space-y-2 overflow-y-auto p-1 md:mx-0 md:max-h-none md:overflow-visible md:p-0">
        {filtered.length === 0 && (
          <p
            className="rounded-xl p-4 text-base"
            style={{ background: `${PINK}08`, color: MUTED }}
          >
            No services available yet — please check back soon.
          </p>
        )}
        {filtered.map((s) => {
          const active = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:translate-x-0.5"
              style={{
                borderColor: active ? PINK : '#e8e8f0',
                background: active ? `${PINK}08` : '#fff',
                boxShadow: active
                  ? `0 0 0 2px ${PINK}22`
                  : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex-1">
                <p className="font-medium" style={{ color: DARK }}>
                  {s.name}
                </p>
                {s.duration && (
                  <p
                    className="flex items-center gap-1 text-sm"
                    style={{ color: MUTED }}
                  >
                    <Clock size={17} /> {s.duration}
                  </p>
                )}
              </div>
              <p
                className="text-base font-semibold whitespace-nowrap"
                style={{ color: active ? PINK : DARK }}
              >
                <Price amount={s.price} />
              </p>
              <div
                className="flex size-5 items-center justify-center rounded-full border-2"
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

export default ServiceStep;
