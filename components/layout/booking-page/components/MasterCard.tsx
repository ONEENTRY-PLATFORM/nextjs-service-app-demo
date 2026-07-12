import { Check, Star } from 'lucide-react';
import type { JSX } from 'react';

import { CYAN, DARK, DESC_MIN_H, MUTED, PINK } from '../constants';
import type { BookingMaster, BookingSalon } from '../types';
import Portrait from './Portrait';
import Price from './Price';
import SalonChips from './SalonChips';

/**
 * MasterCard — a single specialist card of the specialist step: a compact
 * avatar row on mobile and a photo card with a rating pill on desktop. The
 * chips block reserves a shared min-height so dividers align across the grid.
 * @param   {object}         props           - Component properties
 * @param   {BookingMaster}  props.master    - Specialist to render
 * @param   {boolean}        props.active    - This card is the current selection
 * @param   {() => void}     props.onSelect  - Select this specialist
 * @param   {BookingSalon[]} props.salons    - Salons of this specialist (chips)
 * @param   {number | null}  props.price     - Exact/`from` price (`null` hides the line)
 * @param   {boolean}        props.showFrom  - Prefix the price with "from" (no chosen service)
 * @param   {string}         props.chipsMinH - Shared chips min-height (desktop rhythm)
 * @returns {JSX.Element}                    Master card
 */
const MasterCard = ({
  master: m,
  active,
  onSelect,
  salons,
  price,
  showFrom,
  chipsMinH,
}: {
  master: BookingMaster;
  active: boolean;
  onSelect: () => void;
  salons: BookingSalon[];
  price: number | null;
  showFrom: boolean;
  chipsMinH: string;
}): JSX.Element => (
  <>
    {/* MOBILE compact card — circular avatar + info row */}
    <div
      onClick={onSelect}
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
            photo={m.photo}
            alt={m.name}
            sizes="64px"
            className="object-cover object-top"
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
          <div className="flex items-start justify-between gap-2">
            <p
              className="truncate text-base leading-tight font-bold"
              style={{ color: DARK }}
            >
              {m.name}
            </p>
            <span className="mt-0.5 flex shrink-0 items-center gap-1">
              <Star size={16} fill={CYAN} color={CYAN} />
              <span className="text-sm font-bold" style={{ color: DARK }}>
                {m.rating.toFixed(1)}
              </span>
              {m.reviews !== null && (
                <span className="text-sm" style={{ color: MUTED }}>
                  ({m.reviews})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-base font-bold" style={{ color: PINK }}>
              {m.specialties.join(' · ')}
            </p>
            {m.grade && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ background: '#ece3d4', color: '#8a7a5c' }}
              >
                {m.grade}
              </span>
            )}
          </div>
          <p
            className="mt-3 line-clamp-2 text-base leading-snug"
            style={{ color: MUTED }}
          >
            {m.bio}
          </p>
          {price !== null && (
            <p className="mt-1.5 flex items-baseline gap-1.5">
              {showFrom && (
                <span
                  className="text-xs font-medium tracking-wider uppercase"
                  style={{ color: MUTED }}
                >
                  from
                </span>
              )}
              <span
                className="text-xl leading-none font-semibold"
                style={{ color: DARK }}
              >
                <Price big amount={price} />
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

    {/* DESKTOP card — photo, rating pill, body, salon chips */}
    <div
      onClick={onSelect}
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
          photo={m.photo}
          alt={m.name}
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover object-top"
        />

        {active && (
          <div
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full"
            style={{ background: PINK, boxShadow: `0 0 12px ${PINK}` }}
          >
            <Check size={16} color="#fff" />
          </div>
        )}

        {/* Rating pill — bottom-right of photo */}
        <div
          className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: 'rgba(20,20,30,0.85)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Star size={16} fill={CYAN} color={CYAN} />
          <span className="text-xs font-bold text-white">
            {m.rating.toFixed(1)}
            {m.reviews !== null && <> ({m.reviews})</>}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-white">
        <div className="flex flex-col gap-2 p-4">
          <p
            className="truncate text-lg leading-tight font-bold"
            style={{ color: DARK }}
          >
            {m.name}
          </p>
          <p className="truncate text-base font-bold" style={{ color: PINK }}>
            {m.specialties.join(' · ')}
          </p>
          {m.grade && (
            <span
              className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: '#ece3d4', color: '#8a7a5c' }}
            >
              {m.grade}
            </span>
          )}
          <p
            className="line-clamp-3 text-base leading-snug"
            style={{ color: MUTED, minHeight: DESC_MIN_H }}
          >
            {m.bio}
          </p>
          {price !== null && (
            <p className="mt-1 flex items-baseline gap-1.5">
              {showFrom && (
                <span
                  className="text-xs font-medium tracking-wider uppercase"
                  style={{ color: MUTED }}
                >
                  from
                </span>
              )}
              <span
                className="text-2xl leading-none font-semibold"
                style={{ color: DARK }}
              >
                <Price big amount={price} />
              </span>
            </p>
          )}
        </div>

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

export default MasterCard;
