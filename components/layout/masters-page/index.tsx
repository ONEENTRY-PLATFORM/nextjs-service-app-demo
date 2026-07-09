'use client';

import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Search,
  Star,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

import MasterCard from './components/MasterCard';
import type { MasterItem, MastersMainCategory, SalonOption } from './taxonomy';
import { MASTERS_MAIN_CATS } from './taxonomy';

/**
 * MastersPageContent — the specialists page body ported from the static-html
 * mock (`MastersPage.tsx`): a salon filter (three cards on desktop, a
 * dropdown on mobile), main category chips (Hair/Face/Body/Nails), a
 * specialist quick-link row on desktop, a searchable specialist row list on
 * mobile, a counter with "Clear all" and profession card sections separated
 * by soft dividers.
 *
 * Pure client-side filtering over a pre-built specialist list — degrades to
 * an empty-state message when nothing matches.
 * @param   {object}        props         - Component properties
 * @param   {MasterItem[]}  props.masters - Full specialist list
 * @param   {SalonOption[]} props.salons  - Salon filter options
 * @returns {JSX.Element}                 Masters page content
 */
const MastersPageContent = ({
  masters,
  salons,
}: {
  masters: MasterItem[];
  salons: SalonOption[];
}): JSX.Element => {
  const [mainCat, setMainCat] = useState<MastersMainCategory>('HAIR');
  /** Selected salon id; `null` = all salons */
  const [salonId, setSalonId] = useState<string | null>(null);
  /** Mobile salon dropdown open state */
  const [salonOpen, setSalonOpen] = useState(false);
  /** Free-text specialist search (mobile & tablet) */
  const [query, setQuery] = useState('');

  /** Specialists at the selected salon working in the active main category */
  const inMain = useMemo(
    () =>
      masters.filter(
        (m) =>
          (!salonId || m.salonId === salonId) && m.categories.includes(mainCat),
      ),
    [masters, salonId, mainCat],
  );

  /** Narrowed by the specialist search — feeds both the rows and the cards */
  const rendered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? inMain.filter((m) => m.name.toLowerCase().includes(q)) : inMain;
  }, [inMain, query]);

  /** Card sections grouped by profession, in first-seen order */
  const sections = useMemo(() => {
    const bySection = new Map<string, MasterItem[]>();
    for (const master of rendered) {
      const list = bySection.get(master.section);
      if (list) {
        list.push(master);
      } else {
        bySection.set(master.section, [master]);
      }
    }
    return Array.from(bySection.values());
  }, [rendered]);

  const selectedSalon = salons.find((s) => s.id === salonId);
  const hasActiveFilter =
    mainCat !== 'HAIR' || salonId !== null || query.trim() !== '';

  /** Reset every filter back to the defaults */
  const clearAll = () => {
    setMainCat('HAIR');
    setSalonId(null);
    setQuery('');
  };

  return (
    <div>
      {/* ── Filter block ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 pt-8 pb-4 md:px-8">
        {/* Salon filter — DESKTOP: edge-to-edge cards */}
        {salons.length > 0 && (
          <div className="mb-6 hidden gap-3 lg:grid lg:grid-cols-3">
            {salons.map((salon, idx) => {
              const active = salonId === salon.id;
              return (
                <button
                  key={salon.id}
                  onClick={() => setSalonId(active ? null : salon.id)}
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
        )}

        {/* Salon filter — MOBILE: compact dropdown */}
        {salons.length > 0 && (
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
                      setSalonId(null);
                      setSalonOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-base font-semibold ${
                      salonId === null
                        ? 'bg-fuchsia-500/5 text-accent-pink'
                        : 'text-slate-400'
                    }`}
                  >
                    All studios
                  </button>
                  {salons.map((salon, idx) => {
                    const active = salonId === salon.id;
                    return (
                      <button
                        key={salon.id}
                        onClick={() => {
                          setSalonId(salon.id);
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
        )}

        {/* Main category chips — mobile: scrollable row; desktop: centered */}
        <div
          className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 lg:mx-0 lg:flex-wrap lg:items-center lg:justify-center lg:px-0 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {MASTERS_MAIN_CATS.map((cat) => {
            const active = mainCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setMainCat(cat.id)}
                className={`flex min-w-28 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 lg:min-w-0 lg:px-5 ${
                  active
                    ? 'border-none bg-gradient-brand text-white'
                    : 'border-[1.5px] border-slate-150 bg-white text-slate-400 hover:border-fuchsia-500/35 hover:bg-fuchsia-500/5 hover:text-accent-pink'
                }`}
                style={{
                  boxShadow: active
                    ? '0 6px 20px #ed21f144'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Specialist quick links — DESKTOP: inline · separated row */}
        <div className="mt-5 hidden flex-wrap items-center justify-center gap-2 lg:flex">
          {inMain.length === 0 ? (
            <span className="text-xs text-neutral-300">
              No specialists in this category yet.
            </span>
          ) : (
            inMain.map((master, idx) => (
              <span key={master.id} className="flex items-center gap-3">
                {idx > 0 && (
                  <span
                    aria-hidden
                    className="inline-block size-1 rounded-full bg-accent-pink"
                  />
                )}
                {master.href ? (
                  <Link
                    href={master.href}
                    className="px-1 pb-1 text-base font-medium whitespace-nowrap text-accent-pink underline-offset-4 opacity-75 transition-opacity hover:underline hover:opacity-100"
                  >
                    {master.name}
                  </Link>
                ) : (
                  <span className="px-1 pb-1 text-base font-medium whitespace-nowrap text-accent-pink opacity-75">
                    {master.name}
                  </span>
                )}
              </span>
            ))
          )}
        </div>

        {/* Specialist search — MOBILE + TABLET (the row list below is
            mobile-only; tablet shows the photo cards narrowed by this search) */}
        <div className="mt-4 lg:hidden">
          <div className="relative mb-3">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-300"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search specialist"
              className="w-full rounded-xl border-[1.5px] border-slate-150 bg-white py-2.5 pr-10 pl-9 text-base text-slate-400 transition-colors outline-none focus:border-accent-pink"
            />
            {query.trim() && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Compact specialist row list — mobile only */}
          <div className="space-y-2 md:hidden">
            {rendered.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-300">
                No specialists found.
              </p>
            ) : (
              rendered.map((master) => {
                const rowClass =
                  'flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-slate-150 bg-white px-3 py-3 text-left shadow-sm';
                const row = (
                  <>
                    {master.photo ? (
                      <Image
                        src={master.photo}
                        alt=""
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-full border-2 border-fuchsia-500/20 object-cover object-top"
                      />
                    ) : (
                      <span className="size-12 shrink-0 rounded-full border-2 border-fuchsia-500/20 bg-slate-50" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-slate-400">
                        {master.name}
                      </span>
                      <span className="block truncate text-sm text-neutral-300">
                        {master.role}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-slate-400">
                      <Star
                        size={18}
                        className="fill-accent-cyan text-accent-cyan"
                      />{' '}
                      {master.rating.toFixed(1)}
                    </span>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-neutral-300"
                    />
                  </>
                );
                return master.href ? (
                  <Link key={master.id} href={master.href} className={rowClass}>
                    {row}
                  </Link>
                ) : (
                  <div key={master.id} className={rowClass}>
                    {row}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Counter + Clear all */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <p className="text-sm text-neutral-300">
            {rendered.length}{' '}
            {rendered.length === 1 ? 'specialist' : 'specialists'}
          </p>
          {hasActiveFilter && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold tracking-wider text-accent-pink uppercase transition-colors hover:bg-fuchsia-500/10"
            >
              <X size={17} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Card sections — tablet & desktop (mobile uses the row list) ──── */}
      <div className="hidden pb-4 md:block">
        {sections.length === 0 ? (
          <div className="mx-auto max-w-7xl px-3 py-16 text-center md:px-8">
            <p className="text-sm text-neutral-300">
              No specialists match the current filter.
            </p>
            <button
              onClick={clearAll}
              className="mt-3 rounded-full bg-fuchsia-500/10 px-5 py-2 text-xs font-bold tracking-wider text-accent-pink uppercase transition-colors hover:bg-fuchsia-500/20"
            >
              Clear filters
            </button>
          </div>
        ) : (
          sections.map((group, idx) => (
            <section
              key={group[0]?.section ?? String(idx)}
              className="py-5 md:py-7"
            >
              <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-8 px-3 md:gap-12 md:px-8 lg:gap-17.5">
                {group.map((master) => (
                  <MasterCard key={master.id} item={master} />
                ))}
              </div>

              {/* Soft divider between profession sections (except last) */}
              {idx < sections.length - 1 && (
                <div
                  className="mx-auto mt-5 h-px w-3/5"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, #f7f7fb 20%, #f7f7fb 80%, transparent)',
                  }}
                />
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default MastersPageContent;
