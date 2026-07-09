'use client';

import { Check, MapPin, Scissors, Search, Star, User } from 'lucide-react';
import Image from 'next/image';
import type { JSX } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';

import {
  ANY_MASTER,
  anySpecialistImg,
  CYAN,
  DARK,
  MUTED,
  PINK,
} from '../constants';
import type { BookingMaster, BookingSalon, BookingService } from '../types';
import CategoryPills from './CategoryPills';
import Price from './Price';

/** Fixed 3-line description clamp height (mock `DESC_MIN_H`) */
const DESC_MIN_H = '4.4em';

/** Concise "Any specialist" subtitle per category (mock `ANY_LABEL`) */
const ANY_LABEL: Record<string, string> = {
  Hair: 'Hair',
  Face: 'Face',
  Body: 'Body',
  Nails: 'Manicure · Pedicure',
};

/**
 * Portrait — the specialist photo with a neutral placeholder while the CMS
 * admin has no `master_image` uploaded.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.photo     - Photo URL (may be empty)
 * @param   {string}      props.alt       - Alt text
 * @param   {string}      props.sizes     - `next/image` sizes hint
 * @param   {string}      props.className - Extra classes of the image
 * @returns {JSX.Element}                 Portrait or placeholder
 */
const Portrait = ({
  photo,
  alt,
  sizes,
  className,
}: {
  photo: string;
  alt: string;
  sizes: string;
  className: string;
}): JSX.Element => {
  if (!photo) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#f7f7fb' }}
      >
        <User size={32} color={MUTED} />
      </div>
    );
  }
  return (
    <Image fill sizes={sizes} src={photo} alt={alt} className={className} />
  );
};

/**
 * SalonChips — the full-width salon pill chips at the bottom of a specialist
 * card (mock salon chips block).
 * @param   {object}         props        - Component properties
 * @param   {BookingSalon[]} props.salons - Salons to list
 * @param   {number}         props.height - Chip height in px (38 mobile / 40 desktop)
 * @returns {JSX.Element}                 Chips column
 */
const SalonChips = ({
  salons,
  height,
}: {
  salons: BookingSalon[];
  height: number;
}): JSX.Element => (
  <>
    {salons.map((s) => (
      <div
        key={s.id}
        className="flex w-full items-center gap-2 rounded-full border px-4"
        style={{ borderColor: '#e8e8f0', background: '#fff', height }}
      >
        <MapPin size={14} color={MUTED} />
        <span
          className="truncate text-base font-semibold"
          style={{ color: DARK }}
        >
          {s.name}
        </span>
      </div>
    ))}
  </>
);

/**
 * SpecialistStep — the specialist selection step of the booking wizard,
 * ported from the static-html mock (`BookingPage.tsx` → `SpecialistStep`):
 * category pills, a desktop name search, a sticky chip of the already chosen
 * service, an "Any specialist" card and the roster cards (compact avatar
 * rows on mobile, photo cards on desktop). The desktop grid is capped at two
 * rows and scrolls beyond that.
 * @param   {object}                     props                  - Component properties
 * @param   {BookingMaster[]}            props.masters          - Specialists after the wizard's cross-filters
 * @param   {string}                     props.selected         - Chosen specialist id (`''`, id or `__any__`)
 * @param   {(id: string) => void}       props.onSelect         - Select a specialist by id
 * @param   {boolean}                    props.allowAny         - Offer the "Any specialist" card
 * @param   {BookingService | undefined} props.service          - The already chosen service (salon-first flow)
 * @param   {() => void}                 props.onClearService   - Clear the chosen service ("Change")
 * @param   {string[]}                   props.categories       - Category pill labels (with "All")
 * @param   {string}                     props.categoryFilter   - Active category pill
 * @param   {(cat: string) => void}      props.onCategoryChange - Activate a category pill
 * @param   {BookingSalon[]}             props.salons           - All salons (chips of the cards)
 * @param   {BookingSalon | undefined}   props.selectedSalon    - Chosen salon (team photo of the any-card)
 * @returns {JSX.Element}                                       Specialist step
 */
const SpecialistStep = ({
  masters,
  selected,
  onSelect,
  allowAny,
  service,
  onClearService,
  categories,
  categoryFilter,
  onCategoryChange,
  salons,
  selectedSalon,
}: {
  masters: BookingMaster[];
  selected: string;
  onSelect: (id: string) => void;
  allowAny: boolean;
  service?: BookingService | undefined;
  onClearService: () => void;
  categories: string[];
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  salons: BookingSalon[];
  selectedSalon?: BookingSalon | undefined;
}): JSX.Element => {
  /**
   * Desktop only: cap the card grid to 2 rows + scroll, so a long roster
   * doesn't stretch the page. The 2-row height is measured from a real card.
   */
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridMaxH, setGridMaxH] = useState<number | undefined>(undefined);
  /** Desktop: search specialists by name */
  const [specSearch, setSpecSearch] = useState('');

  useEffect(() => {
    const measure = () => {
      const el = gridRef.current;
      const isDesktop =
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 768px)').matches;
      if (!el || !isDesktop) {
        setGridMaxH(undefined);
        return;
      }
      let cardH = 0;
      for (const child of Array.from(el.children)) {
        /** display:none (mobile) cards measure 0 and are skipped */
        const h = (child as HTMLElement).offsetHeight;
        if (h > 0) {
          cardH = h;
          break;
        }
      }
      /** 2 cards + row gap (16) + the grid's own py-1 (8) + rounding buffer */
      setGridMaxH(cardH > 0 ? cardH * 2 + 16 + 8 + 2 : undefined);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [masters, allowAny, categoryFilter, service]);

  /**
   * Reserve identical vertical rhythm across every card: the chips block gets
   * a min-height equal to the max chip count found across all cards, so the
   * divider lands at the same Y position everywhere.
   */
  const maxChipsAcross = Math.max(
    allowAny ? salons.length : 0,
    ...masters.map((m) => m.salonIds.length || salons.length),
    1,
  );
  /** Each chip = 40px, gap-2 = 8px, container p-4 = 32px */
  const chipsMinH = `${maxChipsAcross * 40 + (maxChipsAcross - 1) * 8 + 32}px`;

  const anySpecialties = ANY_LABEL[categoryFilter] ?? categoryFilter;
  /** Desktop name search (empty on mobile → no filtering there) */
  const q = specSearch.trim().toLowerCase();
  const shownMasters = masters.filter((m) => m.name.toLowerCase().includes(q));
  const showAnyCard =
    allowAny && masters.length > 0 && categoryFilter !== 'All' && !q;

  /** "from" price of the any-card — the cheapest matching specialist */
  const anyPrices = masters
    .map((m) => service?.price ?? m.price)
    .filter((v): v is number => v !== null);
  const anyFromPrice = anyPrices.length ? Math.min(...anyPrices) : null;

  /**
   * Salons of a specialist card (all salons when the CMS link is empty).
   * @param   {BookingMaster}  m - Specialist
   * @returns {BookingSalon[]}   Salons of the card chips
   */
  const salonsOf = (m: BookingMaster): BookingSalon[] => {
    const linked = m.salonIds
      .map((sid) => salons.find((s) => s.id === sid))
      .filter((s): s is BookingSalon => Boolean(s));
    return linked.length > 0 ? linked : salons;
  };

  /**
   * Exact price at the chosen service, or the specialist's "from" price.
   * @param   {BookingMaster} m - Specialist
   * @returns {number | null}   Price of the card (`null` hides the line)
   */
  const priceOf = (m: BookingMaster): number | null =>
    service?.price ?? m.price;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-light" style={{ color: DARK }}>
        Choose your specialist
      </h3>

      <CategoryPills
        categories={categories}
        active={categoryFilter}
        onChange={onCategoryChange}
      />

      {/* Desktop: search specialists by first / last name */}
      <div
        className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2.5 md:flex"
        style={{ border: '1.5px solid #e8e8f0' }}
      >
        <Search size={16} color={MUTED} />
        <input
          value={specSearch}
          onChange={(e) => setSpecSearch(e.target.value)}
          placeholder="Search specialist by name"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: DARK }}
        />
      </div>

      {/* Sticky service chip — when a specific service is already chosen */}
      {service && (
        <div
          className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: `${PINK}33`, background: `${PINK}06` }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Scissors size={18} color={PINK} />
            <span
              className="truncate text-base font-semibold"
              style={{ color: DARK }}
            >
              {service.name}
            </span>
            <span
              className="text-sm whitespace-nowrap"
              style={{ color: MUTED }}
            >
              {service.duration && <>· {service.duration} </>}·{' '}
              <Price amount={service.price} />
            </span>
          </div>
          <button
            onClick={onClearService}
            className="text-sm font-bold tracking-wider uppercase"
            style={{ color: PINK }}
          >
            Change
          </button>
        </div>
      )}

      {masters.length === 0 && (
        <p
          className="rounded-xl p-4 text-base"
          style={{ background: `${PINK}08`, color: MUTED }}
        >
          {categoryFilter === 'All'
            ? 'No specialists match the previous selections. Try a different studio or service.'
            : `No ${categoryFilter} specialists match. Try another category.`}
        </p>
      )}

      <div
        ref={gridRef}
        style={{ maxHeight: gridMaxH }}
        className="-mx-1 grid max-h-115 grid-cols-1 items-stretch gap-4 overflow-y-auto p-1 sm:grid-cols-2 md:max-h-none lg:grid-cols-3"
      >
        {/* MOBILE compact "Any specialist" card — circular avatar + info row */}
        {showAnyCard && (
          <div
            onClick={() => onSelect(ANY_MASTER)}
            className="cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99] md:hidden"
            style={{
              borderColor: selected === ANY_MASTER ? PINK : '#e8e8f0',
              boxShadow:
                selected === ANY_MASTER
                  ? `0 0 0 3px ${PINK}22, 0 8px 24px ${PINK}22`
                  : '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex gap-3 p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                <Portrait
                  photo={anySpecialistImg(selectedSalon)}
                  alt="Our team"
                  sizes="64px"
                  className="object-cover"
                />
                {selected === ANY_MASTER && (
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
                <p
                  className="truncate text-base font-bold"
                  style={{ color: PINK }}
                >
                  {anySpecialties}
                </p>
                <p
                  className="mt-0.5 line-clamp-2 text-base leading-snug"
                  style={{ color: MUTED }}
                >
                  We&apos;ll assign the first available master who can perform
                  this service. Soonest available slot included.
                </p>
                {anyFromPrice !== null && (
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
                      <Price big amount={anyFromPrice} />
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
        )}

        {/* DESKTOP "Any specialist" card — group photo + card body */}
        {showAnyCard && (
          <div
            onClick={() => onSelect(ANY_MASTER)}
            className="hidden h-full cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 md:flex md:flex-col"
            style={{
              borderColor: selected === ANY_MASTER ? PINK : '#e8e8f0',
              boxShadow:
                selected === ANY_MASTER
                  ? `0 0 0 3px ${PINK}22, 0 8px 24px ${PINK}22`
                  : '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div className="relative h-56 overflow-hidden">
              <Portrait
                photo={anySpecialistImg(selectedSalon)}
                alt="Our team"
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
              {selected === ANY_MASTER && (
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
                <p
                  className="truncate text-base font-bold"
                  style={{ color: PINK }}
                >
                  {anySpecialties}
                </p>
                <p
                  className="line-clamp-3 text-base leading-snug"
                  style={{ color: MUTED, minHeight: DESC_MIN_H }}
                >
                  We&apos;ll assign the first available master who can perform
                  this service. Soonest available slot included.
                </p>
                {anyFromPrice !== null && (
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
                      <Price big amount={anyFromPrice} />
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
        )}

        {shownMasters.map((m) => {
          const active = selected === m.id;
          const mSalons = salonsOf(m);
          const exactPrice = priceOf(m);
          return (
            <Fragment key={m.id}>
              {/* MOBILE compact card — circular avatar + info row */}
              <div
                onClick={() => onSelect(m.id)}
                className="cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99] md:hidden"
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
                        <span
                          className="text-sm font-bold"
                          style={{ color: DARK }}
                        >
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
                      <p
                        className="truncate text-base font-bold"
                        style={{ color: PINK }}
                      >
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
                    {exactPrice !== null && (
                      <p className="mt-1.5 flex items-baseline gap-1.5">
                        {!service && (
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
                          <Price big amount={exactPrice} />
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t" style={{ borderColor: '#e8e8f0' }} />
                <div className="flex flex-col gap-2 p-3">
                  <SalonChips salons={mSalons} height={38} />
                </div>
              </div>

              {/* DESKTOP card — photo, rating pill, body, salon chips */}
              <div
                onClick={() => onSelect(m.id)}
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
                      style={{
                        background: PINK,
                        boxShadow: `0 0 12px ${PINK}`,
                      }}
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
                    <p
                      className="truncate text-base font-bold"
                      style={{ color: PINK }}
                    >
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
                    {exactPrice !== null && (
                      <p className="mt-1 flex items-baseline gap-1.5">
                        {!service && (
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
                          <Price big amount={exactPrice} />
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex-1" />
                  <div
                    className="border-t"
                    style={{ borderColor: '#e8e8f0' }}
                  />
                  <div
                    className="flex flex-col gap-2 p-4"
                    style={{ minHeight: chipsMinH }}
                  >
                    <SalonChips salons={mSalons} height={40} />
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
        {q && shownMasters.length === 0 && (
          <p
            className="col-span-full py-6 text-center text-base"
            style={{ color: MUTED }}
          >
            No specialists match “{specSearch}”.
          </p>
        )}
      </div>
    </div>
  );
};

export default SpecialistStep;
