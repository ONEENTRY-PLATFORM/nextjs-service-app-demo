'use client';

import { Search, X } from 'lucide-react';
import type { JSX } from 'react';

import type { GalleryMainCategory } from '../taxonomy';
import { GALLERY_MAIN_CATS } from '../taxonomy';
import GalleryFilterLinks from './GalleryFilterLinks';

/** Filter tab: by service subcategory or by specialist */
export type GalleryTab = 'service' | 'specialist';

/**
 * GalleryFilterBar — the gallery filter controls (mock `GalleryPage.tsx`):
 * Service/Specialist tabs, main category chips (Hair/Face/Body/Nails), the
 * dynamic subcategory/specialist link row ({@link GalleryFilterLinks}), a
 * mobile search field and the photo counter with "Clear all".
 * @param   {object}                           props                   - Component properties
 * @param   {GalleryTab}                       props.tab               - Active filter tab
 * @param   {(t: GalleryTab) => void}          props.onTab             - Switch the tab
 * @param   {GalleryMainCategory}              props.mainCat           - Active main category
 * @param   {(c: GalleryMainCategory) => void} props.onMainCat         - Switch the main category
 * @param   {readonly string[]}                props.subCats           - Subcategories of the main category
 * @param   {string}                           props.activeSubCat      - Selected subcategory (`''` = none)
 * @param   {(v: string) => void}              props.onSubCat          - Set the subcategory
 * @param   {string[]}                         props.specialistsInMain - Specialists with photos in the category
 * @param   {string}                           props.activeSpecialist  - Selected specialist (`''` = none)
 * @param   {(v: string) => void}              props.onSpecialist      - Set the specialist
 * @param   {string}                           props.query             - Free-text search value
 * @param   {(v: string) => void}              props.onQuery           - Set the search value
 * @param   {number}                           props.count             - Number of matched photos
 * @param   {boolean}                          props.hasActiveFilter   - Any filter differs from the defaults
 * @param   {() => void}                       props.onClearAll        - Reset every filter
 * @returns {JSX.Element}                                              Filter block
 */
const GalleryFilterBar = ({
  tab,
  onTab,
  mainCat,
  onMainCat,
  subCats,
  activeSubCat,
  onSubCat,
  specialistsInMain,
  activeSpecialist,
  onSpecialist,
  query,
  onQuery,
  count,
  hasActiveFilter,
  onClearAll,
}: {
  tab: GalleryTab;
  onTab: (t: GalleryTab) => void;
  mainCat: GalleryMainCategory;
  onMainCat: (c: GalleryMainCategory) => void;
  subCats: readonly string[];
  activeSubCat: string;
  onSubCat: (v: string) => void;
  specialistsInMain: string[];
  activeSpecialist: string;
  onSpecialist: (v: string) => void;
  query: string;
  onQuery: (v: string) => void;
  count: number;
  hasActiveFilter: boolean;
  onClearAll: () => void;
}): JSX.Element => (
  <div className="mx-auto max-w-7xl px-3 pt-8 pb-6 md:px-8">
    {/* Tabs: Service | Specialist */}
    <div className="mb-5 flex items-center justify-center gap-10">
      {(['service', 'specialist'] as const).map((t) => {
        const active = tab === t;
        return (
          <button
            key={t}
            onClick={() => onTab(t)}
            className={`relative px-1 pb-1 text-base font-medium capitalize transition-colors ${
              active ? 'text-accent-pink' : 'text-neutral-300'
            }`}
          >
            {t === 'service' ? 'Service' : 'Specialist'}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-pink" />
            )}
          </button>
        );
      })}
    </div>

    {/* Main category chips — mobile: scrollable row; desktop: centered */}
    <div
      className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:items-center md:justify-center md:px-0 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      {GALLERY_MAIN_CATS.map((cat) => {
        const active = mainCat === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onMainCat(cat.id)}
            className={`flex min-w-28 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 md:min-w-0 md:px-5 ${
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

    {/* Dynamic sub-row: subcategories OR specialists, depending on tab */}
    <div className="mt-5">
      {tab === 'service' ? (
        <GalleryFilterLinks
          options={subCats}
          activeValue={activeSubCat}
          onSelect={onSubCat}
        />
      ) : specialistsInMain.length === 0 ? (
        <p className="text-center text-sm text-neutral-300">
          No specialists in this category yet.
        </p>
      ) : (
        <GalleryFilterLinks
          options={specialistsInMain}
          activeValue={activeSpecialist}
          onSelect={onSpecialist}
        />
      )}
    </div>

    {/* Search by service / specialist — mobile only */}
    <div className="relative mt-4 md:hidden">
      <Search
        size={18}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-neutral-300"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={
          tab === 'specialist' ? 'Search by specialist…' : 'Search by service…'
        }
        className="w-full rounded-xl border-[1.5px] border-slate-150 bg-white px-11 py-3 text-base text-slate-400 shadow-sm transition-colors outline-none focus:border-accent-pink"
      />
      {query.trim() && (
        <button
          onClick={() => onQuery('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-300"
        >
          <X size={16} />
        </button>
      )}
    </div>

    {/* Counter + Clear all */}
    <div className="mt-5 flex items-center justify-center gap-4">
      <p className="text-sm text-neutral-300">
        {count} {count === 1 ? 'photo' : 'photos'}
      </p>
      {hasActiveFilter && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold tracking-wider text-accent-pink uppercase transition-colors hover:bg-fuchsia-500/10"
        >
          <X size={17} /> Clear all
        </button>
      )}
    </div>
  </div>
);

export default GalleryFilterBar;
