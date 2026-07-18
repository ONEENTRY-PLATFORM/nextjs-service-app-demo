import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { DARK, DESC_MIN_H, MUTED, PINK } from '../constants';
import type { BookingSalon } from '../types';
import Portrait from './Portrait';
import Price from './Price';
import SalonChips from './SalonChips';

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
 * @param   {string}         props.chipsMinH   - Shared chips min-height (desktop rhythm)
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
  chipsMinH,
}: {
  active: boolean;
  onSelect: () => void;
  photo: string;
  specialties: string;
  fromPrice: number | null;
  currency?: string | undefined;
  salons: BookingSalon[];
  chipsMinH: string;
}): JSX.Element => (
  <>
    {/* MOBILE compact "Any specialist" card — circular avatar + info row */}
    <div
      onClick={onSelect}
      data-testid="booking-any-specialist"
      className="cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 active:scale-99 md:hidden"
      style={{
        borderColor: active ? PINK : '#e8e8f0',
        boxShadow: active
          ? `0 0 0 3px ${PINK}22, 0 8px 24px ${PINK}22`
          : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex gap-3 p-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
          <Portrait
            photo={photo}
            alt="Our team"
            sizes="64px"
            className="object-cover"
          />
          {active && (
            <div
              className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white"
              style={{ background: PINK }}
            >
              <Check size={17} color="#fff" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-base leading-tight font-bold"
            style={{ color: DARK }}
          >
            Any specialist
          </p>
          <p className="truncate text-base font-bold" style={{ color: PINK }}>
            {specialties}
          </p>
          <p
            className="mt-0.5 line-clamp-2 text-base leading-snug"
            style={{ color: MUTED }}
          >
            We&apos;ll assign the first available master who can perform this
            service. Soonest available slot included.
          </p>
          {fromPrice !== null && (
            <p className="mt-1.5 flex items-baseline gap-1.5">
              <span
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: MUTED }}
              >
                from
              </span>
              <span
                className="text-xl leading-none font-semibold"
                style={{ color: DARK }}
              >
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
    </div>

    {/* DESKTOP "Any specialist" card — group photo + card body */}
    <div
      onClick={onSelect}
      data-testid="booking-any-specialist"
      className="hidden h-full cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 md:flex md:flex-col"
      style={{
        borderColor: active ? PINK : '#e8e8f0',
        boxShadow: active
          ? `0 0 0 3px ${PINK}22, 0 8px 24px ${PINK}22`
          : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="relative h-56 overflow-hidden">
        <Portrait
          photo={photo}
          alt="Our team"
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
        {active && (
          <div
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full"
            style={{ background: PINK, boxShadow: `0 0 12px ${PINK}` }}
          >
            <Check size={16} color="#fff" />
          </div>
        )}
      </div>

      {/* Body — identical structure & rhythm to master card */}
      <div className="flex flex-1 flex-col bg-white">
        <div className="flex flex-col gap-2 p-4">
          <p
            className="truncate text-lg leading-tight font-bold"
            style={{ color: DARK }}
          >
            Any specialist
          </p>
          <p className="truncate text-base font-bold" style={{ color: PINK }}>
            {specialties}
          </p>
          <p
            className="line-clamp-3 text-base leading-snug"
            style={{ color: MUTED, minHeight: DESC_MIN_H }}
          >
            We&apos;ll assign the first available master who can perform this
            service. Soonest available slot included.
          </p>
          {fromPrice !== null && (
            <p className="mt-1 flex items-baseline gap-1.5">
              <span
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: MUTED }}
              >
                from
              </span>
              <span
                className="text-2xl leading-none font-semibold"
                style={{ color: DARK }}
              >
                <Price big amount={fromPrice} currency={currency} />
              </span>
            </p>
          )}
        </div>

        {/* Spacer pushes divider to a consistent Y across all cards */}
        <div className="flex-1" />
        <div className="border-t" style={{ borderColor: '#e8e8f0' }} />
        <div
          className="flex flex-col gap-2 p-4"
          style={{ minHeight: chipsMinH }}
        >
          <SalonChips salons={salons} height={40} />
        </div>
      </div>
    </div>
  </>
);

export default AnySpecialistCard;
