'use client';

import { Check, Clock } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import { CATEGORY_ORDER, DARK, MUTED, PINK } from '../constants';
import type { BookingService } from '../types';
import CategoryPills from './CategoryPills';
import Price from './Price';

/**
 * ServiceStep — the service selection step of the booking wizard, ported
 * from the static-html mock (`BookingPage.tsx` → `ServiceStep`): category
 * pills over a list of service rows (name, duration with a clock icon, price
 * and a checkbox circle). Multiple services can be picked for one appointment;
 * only the categories the passed services actually cover get a pill, and a
 * single category drops the "All" pill.
 * @param   {object}               props             - Component properties
 * @param   {BookingService[]}     props.services    - Services available for the selection
 * @param   {string[]}             props.selectedIds - Ids of the chosen services (`[]` when none)
 * @param   {(id: string) => void} props.onToggle    - Toggle a service by id
 * @returns {JSX.Element}                            Service step
 */
const ServiceStep = ({
  services,
  selectedIds,
  onToggle,
}: {
  services: BookingService[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}): JSX.Element => {
  const dict = useDict();

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
    <div className="space-y-4" data-testid="booking-step-service">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-light text-slate-400">
          {(dict?.booking_choose_services_text?.value as string | undefined) ||
            'Choose services'}
        </h3>
        {selectedIds.length > 0 && (
          <span
            className="text-sm font-semibold whitespace-nowrap text-fuchsia-500"
            data-testid="booking-services-count"
          >
            {selectedIds.length}{' '}
            {(dict?.booking_selected_suffix?.value as string | undefined) ||
              'selected'}
          </span>
        )}
      </div>
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
            data-testid="booking-services-empty"
          >
            {(dict?.booking_no_services_text?.value as string | undefined) ||
              'No services available yet — please check back soon.'}
          </p>
        )}
        {filtered.map((s) => {
          const active = selectedIds.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onToggle(s.id)}
              aria-pressed={active}
              className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:translate-x-0.5"
              style={{
                borderColor: active ? PINK : '#e8e8f0',
                background: active ? `${PINK}08` : '#fff',
                boxShadow: active
                  ? `0 0 0 2px ${PINK}22`
                  : '0 1px 4px rgba(0,0,0,0.04)',
              }}
              data-testid="booking-service-option"
              data-service-id={s.id}
            >
              <div className="flex-1">
                <p className="font-medium text-slate-400">{s.name}</p>
                {s.duration && (
                  <p className="flex items-center gap-1 text-sm text-neutral-300">
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
