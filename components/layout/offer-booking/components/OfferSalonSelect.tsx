import { ChevronDown, MapPin } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import type { BookingSalon } from '@/components/layout/booking-page/types';
import { dictText } from '@/components/utils/dictText';

/**
 * OfferSalonSelect — the "1. Location" block of the modal's first step: a
 * dropdown of the salons, each option carrying its address. Same hand-rolled
 * dropdown pattern as the salon filters elsewhere (trigger + full-screen
 * click-away layer + absolute panel).
 * @param   {object}               props            - Component properties
 * @param   {BookingSalon[]}       props.salons     - Salons to offer
 * @param   {number | null}        props.selectedId - Chosen salon page id
 * @param   {string}               props.accent     - Accent colour of the offer
 * @param   {(id: number) => void} props.onSelect   - Choose a salon
 * @returns {JSX.Element}                           Salon picker block
 */
const OfferSalonSelect = ({
  salons,
  selectedId,
  accent,
  onSelect,
}: {
  salons: BookingSalon[];
  selectedId: number | null;
  accent: string;
  onSelect: (id: number) => void;
}): JSX.Element => {
  const dict = useDict();
  const [open, setOpen] = useState(false);

  const selectedIndex = salons.findIndex((s) => s.id === selectedId);
  const selected = selectedIndex >= 0 ? salons[selectedIndex] : undefined;

  return (
    <div>
      <p className="mb-2.5 text-xs font-black tracking-wider text-neutral-300 uppercase">
        1. {dictText(dict, 'offer_booking_location_text', 'Location')}
      </p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          data-testid="offer-salon-select"
          className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-white px-4 py-3"
          style={{
            border: '1.5px solid #e8e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          <span className="flex min-w-0 items-center gap-2 text-base font-semibold text-slate-400">
            <MapPin size={14} color={accent} className="shrink-0" />
            <span className="truncate">
              {selected
                ? `${dictText(dict, 'offer_salon_prefix_text', 'Salon')} ${selectedIndex + 1} — ${selected.name}`
                : dictText(
                    dict,
                    'booking_choose_studio_text',
                    'Choose your studio',
                  )}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-neutral-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div
              className="absolute inset-x-0 z-20 mt-1 overflow-hidden rounded-xl bg-white"
              style={{
                border: '1.5px solid #e8e8f0',
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
              }}
            >
              {salons.map((salon, index) => {
                const active = salon.id === selectedId;
                return (
                  <button
                    key={salon.id}
                    type="button"
                    data-testid="offer-salon-option"
                    onClick={() => {
                      onSelect(salon.id);
                      setOpen(false);
                    }}
                    className="w-full cursor-pointer border-t px-4 py-3 text-left first:border-t-0"
                    style={{
                      borderColor: '#f1f1f5',
                      background: active ? `${accent}12` : 'transparent',
                    }}
                  >
                    <span
                      className="block text-base font-semibold"
                      style={{ color: active ? accent : '#4c4d56' }}
                    >
                      {dictText(dict, 'offer_salon_prefix_text', 'Salon')}{' '}
                      {index + 1} — {salon.name}
                    </span>
                    {salon.address && (
                      <span className="mt-0.5 flex items-center gap-1 text-sm text-neutral-300">
                        <MapPin size={15} className="shrink-0" />
                        <span className="truncate">{salon.address}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfferSalonSelect;
