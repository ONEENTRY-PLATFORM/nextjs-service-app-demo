'use client';

import { Scissors, Search } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import { ANY_MASTER, anySpecialistImg, MUTED, PINK } from '../constants';
import type { BookingMaster, BookingSalon, BookingService } from '../types';
import AnySpecialistCard from './AnySpecialistCard';
import CategoryPills from './CategoryPills';
import MasterCard from './MasterCard';
import Price from './Price';

/** Concise "Any specialist" subtitle per category (mock `ANY_LABEL`) */
const ANY_LABEL: Record<string, string> = {
  Hair: 'Hair',
  Face: 'Face',
  Body: 'Body',
  Nails: 'Manicure · Pedicure',
};

/**
 * SpecialistStep — the specialist selection step of the booking wizard,
 * ported from the static-html mock (`BookingPage.tsx` → `SpecialistStep`):
 * category pills, a desktop name search, a sticky chip of the already chosen
 * service, an "Any specialist" card and the roster cards (compact avatar
 * rows on mobile, photo cards on desktop). The desktop grid is capped at two
 * rows and scrolls beyond that. The card bodies live in {@link AnySpecialistCard}
 * and {@link MasterCard}.
 * @param   {object}                   props                  - Component properties
 * @param   {BookingMaster[]}          props.masters          - Specialists after the wizard's cross-filters
 * @param   {string}                   props.selected         - Chosen specialist id (`''`, id or `__any__`)
 * @param   {(id: string) => void}     props.onSelect         - Select a specialist by id
 * @param   {boolean}                  props.allowAny         - Offer the "Any specialist" card
 * @param   {BookingService[]}         props.services         - The already chosen services (salon-first flow)
 * @param   {() => void}               props.onClearService   - Clear the chosen services ("Change")
 * @param   {string[]}                 props.categories       - Category pill labels (with "All")
 * @param   {string}                   props.categoryFilter   - Active category pill
 * @param   {(cat: string) => void}    props.onCategoryChange - Activate a category pill
 * @param   {BookingSalon[]}           props.salons           - All salons (chips of the cards)
 * @param   {BookingSalon | undefined} props.selectedSalon    - Chosen salon (team photo of the any-card)
 * @returns {JSX.Element}                                     Specialist step
 */
const SpecialistStep = ({
  masters,
  selected,
  onSelect,
  allowAny,
  services,
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
  services: BookingService[];
  onClearService: () => void;
  categories: string[];
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  salons: BookingSalon[];
  selectedSalon?: BookingSalon | undefined;
}): JSX.Element => {
  const dict = useDict();

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
  }, [masters, allowAny, categoryFilter, services]);

  const anySpecialties = ANY_LABEL[categoryFilter] ?? categoryFilter;
  /** Desktop name search (empty on mobile → no filtering there) */
  const q = specSearch.trim().toLowerCase();
  const shownMasters = masters.filter((m) => m.name.toLowerCase().includes(q));
  const showAnyCard =
    allowAny && masters.length > 0 && categoryFilter !== 'All' && !q;

  /**
   * Combined price / currency of the picked services (salon-first flow). When
   * services are chosen the cards show their exact total instead of a "from"
   * master price; `null` when nothing priced was picked.
   */
  const hasServices = services.length > 0;
  const pricedServices = services.filter((s) => s.price !== null);
  const servicesTotal = pricedServices.length
    ? pricedServices.reduce((sum, s) => sum + (s.price ?? 0), 0)
    : null;
  const servicesCurrency = pricedServices[0]?.currency;
  /**
   * Price to show on a specialist card: the picked-services total when any were
   * chosen (and priced), otherwise that specialist's own "from" price.
   * @param   {BookingMaster} m - Specialist of the card
   * @returns {number | null}   Price to display
   */
  const cardPrice = (m: BookingMaster): number | null =>
    hasServices && servicesTotal !== null ? servicesTotal : m.price;

  /** "from" price of the any-card — the cheapest matching specialist */
  const anyPrices = masters
    .map((m) => cardPrice(m))
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

  return (
    <div className="space-y-4" data-testid="booking-step-specialist">
      <h3 className="text-lg font-light text-slate-400">
        {(dict?.booking_choose_specialist_text?.value as string | undefined) ||
          'Choose your specialist'}
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
          placeholder={
            (dict?.booking_search_specialist_placeholder?.value as
              string | undefined) || 'Search specialist by name'
          }
          className="flex-1 bg-transparent text-sm text-slate-400 outline-none"
        />
      </div>

      {/* Sticky service chip — when one or more services are already chosen */}
      {hasServices && (
        <div
          className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: `${PINK}33`, background: `${PINK}06` }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Scissors size={18} color={PINK} />
            <span className="truncate text-base font-semibold text-slate-400">
              {services.length === 1
                ? services[0]?.name
                : `${services.length} ${(dict?.booking_services_suffix?.value as string | undefined) || 'services'}`}
            </span>
            <span className="text-sm whitespace-nowrap text-neutral-300">
              {services.length === 1 && services[0]?.duration && (
                <>· {services[0].duration} </>
              )}
              · <Price amount={servicesTotal} currency={servicesCurrency} />
            </span>
          </div>
          <button
            onClick={onClearService}
            className="text-sm font-bold tracking-wider text-fuchsia-500 uppercase"
          >
            {(dict?.change_text?.value as string | undefined) || 'Change'}
          </button>
        </div>
      )}

      {masters.length === 0 && (
        <p
          className="rounded-xl p-4 text-base"
          style={{ background: `${PINK}08`, color: MUTED }}
          data-testid="booking-specialists-empty"
        >
          {categoryFilter === 'All'
            ? (dict?.booking_no_specialists_text?.value as
                string | undefined) ||
              'No specialists match the previous selections. Try a different studio or service.'
            : (
                (dict?.booking_no_cat_specialists_text?.value as
                  string | undefined) ||
                'No %cat% specialists match. Try another category.'
              ).replace('%cat%', categoryFilter)}
        </p>
      )}

      <div
        ref={gridRef}
        style={{ maxHeight: gridMaxH }}
        className="-mx-1 grid max-h-115 grid-cols-1 items-stretch gap-4 overflow-y-auto p-1 sm:grid-cols-2 md:max-h-none lg:grid-cols-3"
      >
        {showAnyCard && (
          <AnySpecialistCard
            active={selected === ANY_MASTER}
            onSelect={() => onSelect(ANY_MASTER)}
            photo={anySpecialistImg(selectedSalon)}
            specialties={anySpecialties}
            fromPrice={anyFromPrice}
            currency={servicesCurrency}
            salons={salons}
          />
        )}

        {shownMasters.map((m) => (
          <MasterCard
            key={m.id}
            master={m}
            active={selected === m.id}
            onSelect={() => onSelect(m.id)}
            salons={salonsOf(m)}
            price={cardPrice(m)}
            currency={servicesCurrency}
            showFrom={!hasServices}
          />
        ))}
        {q && shownMasters.length === 0 && (
          <p
            className="col-span-full py-6 text-center text-base text-neutral-300"
            data-testid="booking-specialists-search-empty"
          >
            {(
              (dict?.booking_no_search_specialists_text?.value as
                string | undefined) || 'No specialists match “%q%”.'
            ).replace('%q%', specSearch)}
          </p>
        )}
      </div>
    </div>
  );
};

export default SpecialistStep;
