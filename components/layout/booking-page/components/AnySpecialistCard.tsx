import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import { DESC_MIN_H } from '../constants';
import type { BookingSalon } from '../types';
import { selectableCardStyle } from '../utils/selectableCardStyle';
import Portrait from './Portrait';
import Price from './Price';
import SalonChips from './SalonChips';
import SelectedCheckBadge from './SelectedCheckBadge';

/**
 * AnySpecialistCard — the "Any specialist" card of the specialist step.
 * @param   {object}         props             - Component properties
 * @param   {boolean}        props.active      - This card is the current selection
 * @param   {() => void}     props.onSelect    - Select the "Any specialist" option
 * @param   {string}         props.photo       - Team photo of the chosen salon
 * @param   {string}         props.specialties - Category subtitle (mock `ANY_LABEL`)
 * @param   {number | null}  props.fromPrice   - Cheapest matching "from" price
 * @param   {string}         [props.currency]  - Currency of `fromPrice` from the CMS
 * @param   {BookingSalon[]} props.salons      - Salons listed as chips
 * @returns {JSX.Element}                      Any-specialist card
 */
const AnySpecialistCard = ({
  active,
  onSelect,
  photo,
  specialties,
  fromPrice,
  currency,
  salons,
}: {
  active: boolean;
  onSelect: () => void;
  photo: string;
  specialties: string;
  fromPrice: number | null;
  currency?: string | undefined;
  salons: BookingSalon[];
}): JSX.Element => {
  const dict = useDict();

  return (
    <>
      {/* MOBILE compact "Any specialist" card — circular avatar + info row */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        data-testid="booking-any-specialist"
        className="cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 active:scale-99 md:hidden"
        style={selectableCardStyle(active)}
      >
        <div className="flex gap-3 p-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
            <Portrait
              photo={photo}
              alt="Our team"
              sizes="64px"
              className="object-cover"
            />
            {active && <SelectedCheckBadge variant="mobile" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base leading-tight font-bold text-slate-400">
              {dictText(dict, 'booking_any_specialist_text', 'Any specialist')}
            </p>
            <p className="truncate text-base font-bold text-fuchsia-500">
              {specialties}
            </p>
            <p className="mt-0.5 line-clamp-2 text-base leading-snug text-neutral-300">
              {dictText(
                dict,
                'booking_any_specialist_desc',
                "We'll assign the first available master who can perform this service. Soonest available slot included.",
              )}
            </p>
            {fromPrice !== null && (
              <p className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xs font-medium tracking-wider text-neutral-300 uppercase">
                  {dictText(dict, 'from_text', 'from')}
                </span>
                <span className="text-xl leading-none font-semibold text-slate-400">
                  <Price big amount={fromPrice} currency={currency} />
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="border-t" style={{ borderColor: '#e8e8f0' }} />
        <div className="flex flex-col gap-2 p-3">
          <SalonChips salons={salons} height={38} />
        </div>
      </button>

      {/* DESKTOP "Any specialist" card — group photo + card body */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        data-testid="booking-any-specialist"
        className="hidden h-full cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 md:flex md:flex-col"
        style={selectableCardStyle(active)}
      >
        <div className="relative h-56 overflow-hidden">
          <Portrait
            photo={photo}
            alt="Our team"
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
          {active && <SelectedCheckBadge variant="desktop" />}
        </div>

        {/* Body — identical structure & rhythm to master card */}
        <div className="flex flex-1 flex-col bg-white">
          <div className="flex flex-col gap-2 p-4">
            <p className="truncate text-lg leading-tight font-bold text-slate-400">
              {dictText(dict, 'booking_any_specialist_text', 'Any specialist')}
            </p>
            <p className="truncate text-base font-bold text-fuchsia-500">
              {specialties}
            </p>
            <p
              className="line-clamp-3 text-base leading-snug text-neutral-300"
              style={{ minHeight: DESC_MIN_H }}
            >
              {dictText(
                dict,
                'booking_any_specialist_desc',
                "We'll assign the first available master who can perform this service. Soonest available slot included.",
              )}
            </p>
            {fromPrice !== null && (
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xs font-medium tracking-wider text-neutral-300 uppercase">
                  {dictText(dict, 'from_text', 'from')}
                </span>
                <span className="text-2xl leading-none font-semibold text-slate-400">
                  <Price big amount={fromPrice} currency={currency} />
                </span>
              </p>
            )}
          </div>

          {/* Spacer pins the salon chips to the bottom of the card */}
          <div className="flex-1" />
          <div className="border-t" style={{ borderColor: '#e8e8f0' }} />
          <div className="flex flex-col gap-2 p-4">
            <SalonChips salons={salons} height={40} />
          </div>
        </div>
      </button>
    </>
  );
};

export default AnySpecialistCard;
