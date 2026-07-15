'use client';

import { X } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

import MobileSpecialistList from './components/MobileSpecialistList';
import SalonFilter from './components/SalonFilter';
import SpecialistQuickLinks from './components/SpecialistQuickLinks';
import SpecialistSections from './components/SpecialistSections';
import type { MasterItem, MastersMainCategory, SalonOption } from './taxonomy';
import { MASTERS_MAIN_CATS } from './taxonomy';

/**
 * MastersPageContent — the specialists page body ported from the static-html
 * mock (`MastersPage.tsx`): a salon filter ({@link SalonFilter}), main category
 * chips (Hair/Face/Body/Nails), a specialist quick-link row on desktop
 * ({@link SpecialistQuickLinks}), a searchable specialist row list on mobile
 * ({@link MobileSpecialistList}), a counter with "Clear all" and profession
 * card sections ({@link SpecialistSections}).
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

  const hasActiveFilter =
    mainCat !== 'HAIR' || salonId !== null || query.trim() !== '';

  /** Reset every filter back to the defaults */
  const clearAll = () => {
    setMainCat('HAIR');
    setSalonId(null);
    setQuery('');
  };

  return (
    <div data-testid="masters-page">
      {/* ── Filter block ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 pt-8 pb-4 md:px-8">
        <SalonFilter
          salons={salons}
          selectedId={salonId}
          onSelect={setSalonId}
        />

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

        <SpecialistQuickLinks masters={inMain} />

        <MobileSpecialistList
          query={query}
          onQuery={setQuery}
          masters={rendered}
        />

        {/* Counter + Clear all */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <p className="text-sm text-neutral-300">
            {rendered.length}{' '}
            {rendered.length === 1 ? 'specialist' : 'specialists'}
          </p>
          {hasActiveFilter && (
            <button
              data-testid="masters-clear-all"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold tracking-wider text-accent-pink uppercase transition-colors hover:bg-fuchsia-500/10"
            >
              <X size={17} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Card sections — tablet & desktop (mobile uses the row list) ──── */}
      <SpecialistSections sections={sections} onClearAll={clearAll} />
    </div>
  );
};

export default MastersPageContent;
