'use client';

import { Search, X } from 'lucide-react';
import type { JSX } from 'react';
import { Fragment, useCallback, useMemo, useState } from 'react';

import GalleryGridCell from './components/GalleryGridCell';
import GalleryLightbox from './components/GalleryLightbox';
import type { GalleryItem, GalleryMainCategory } from './taxonomy';
import {
  GALLERY_MAIN_CATS,
  GALLERY_SUBCATEGORIES,
  SUB_TO_MAIN,
} from './taxonomy';

/** Filter tab: by service subcategory or by specialist */
type Tab = 'service' | 'specialist';

/**
 * GalleryPageContent — the gallery page body ported from the static-html
 * mock (`GalleryPage.tsx`): Service/Specialist tabs, main category chips
 * (Hair/Face/Body/Nails), a dynamic subcategory/specialist text-link row,
 * a mobile search field, photo counter with "Clear all", the full-bleed
 * photo grid and a lightbox.
 *
 * Pure client-side filtering over a pre-built photo list — degrades to an
 * empty-state message when the list is empty.
 * @param   {object}                        props                 - Component properties
 * @param   {GalleryItem[]}                 props.items           - Full gallery photo list
 * @param   {GalleryMainCategory|undefined} props.initialCategory - Main category to open with (e.g. from `?category=FACE`)
 * @returns {JSX.Element}                                         Gallery page content
 */
const GalleryPageContent = ({
  items,
  initialCategory,
}: {
  items: GalleryItem[];
  initialCategory?: GalleryMainCategory | undefined;
}): JSX.Element => {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [tab, setTab] = useState<Tab>('service');
  const [mainCat, setMainCat] = useState<GalleryMainCategory>(
    initialCategory ?? 'HAIR',
  );
  const [subCat, setSubCat] = useState<string>('');
  const [specialist, setSpecialist] = useState<string>('');
  /** Free-text search by service / specialist (mobile only) */
  const [query, setQuery] = useState('');

  /** Specialists that have at least one photo in the current main category */
  const specialistsInMain = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .filter((item) => SUB_TO_MAIN[item.category] === mainCat)
            .map((item) => item.master),
        ),
      ),
    [items, mainCat],
  );

  /**
   * Effective filters: a subcategory/specialist pick is ignored while it does
   * not belong to the current main category (derived instead of a state
   * reset in an effect — avoids cascading renders).
   */
  const activeSubCat = subCat && SUB_TO_MAIN[subCat] === mainCat ? subCat : '';
  const activeSpecialist =
    specialist && specialistsInMain.includes(specialist) ? specialist : '';

  const subCats = GALLERY_SUBCATEGORIES[mainCat];

  /**
   * Apply filters: main category always; subcategory & specialist when set;
   * the free-text query matches the service (subcategory) or the specialist.
   */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (SUB_TO_MAIN[item.category] !== mainCat) return false;
      if (activeSubCat && item.category !== activeSubCat) return false;
      if (activeSpecialist && item.master !== activeSpecialist) return false;
      if (q && !`${item.master} ${item.category}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [items, mainCat, activeSubCat, activeSpecialist, query]);

  /**
   * Toggle a photo in the liked set
   * @param {string} id - Photo id
   */
  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null || filtered.length === 0
          ? null
          : (i - 1 + filtered.length) % filtered.length,
      ),
    [filtered.length],
  );
  const nextPhoto = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null || filtered.length === 0 ? null : (i + 1) % filtered.length,
      ),
    [filtered.length],
  );

  const hasActiveFilter =
    activeSubCat !== '' ||
    activeSpecialist !== '' ||
    mainCat !== 'HAIR' ||
    query.trim() !== '';

  /** Reset every filter back to the defaults */
  const clearAll = () => {
    setMainCat('HAIR');
    setSubCat('');
    setSpecialist('');
    setQuery('');
    setTab('service');
  };

  /** Photo currently opened in the lightbox (bounds-checked) */
  const lightboxItem =
    lightboxIndex !== null ? filtered[lightboxIndex] : undefined;

  return (
    <div>
      {/* ── Filter block ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 pt-8 pb-6 md:px-8">
        {/* Tabs: Service | Specialist */}
        <div className="mb-5 flex items-center justify-center gap-10">
          {(['service', 'specialist'] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
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
                onClick={() => setMainCat(cat.id)}
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
            <>
              {/* MOBILE: large scrollable text links with vertical dividers */}
              <div
                className="-mx-3 flex items-center gap-4 overflow-x-auto px-3 pl-4 md:hidden [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none' }}
              >
                {subCats.map((label, idx) => {
                  const active = activeSubCat === label;
                  return (
                    <Fragment key={label}>
                      {idx > 0 && (
                        <span
                          aria-hidden
                          className="h-5 w-px shrink-0 self-center bg-neutral-300"
                        />
                      )}
                      <button
                        onClick={() => setSubCat(active ? '' : label)}
                        className={`shrink-0 border-b-2 pb-1 text-lg font-normal whitespace-nowrap transition-all ${
                          active
                            ? 'border-accent-pink text-accent-pink'
                            : 'border-transparent text-slate-400'
                        }`}
                      >
                        {label}
                      </button>
                    </Fragment>
                  );
                })}
              </div>

              {/* DESKTOP: text-link row with pink dots */}
              <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
                {subCats.map((label, idx) => {
                  const active = activeSubCat === label;
                  return (
                    <span key={label} className="flex items-center gap-3">
                      {idx > 0 && (
                        <span
                          aria-hidden
                          className="inline-block size-1 rounded-full bg-accent-pink"
                        />
                      )}
                      <button
                        onClick={() => setSubCat(active ? '' : label)}
                        className={`relative px-1 pb-1 text-base font-medium text-accent-pink transition-opacity ${
                          active
                            ? 'opacity-100'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        {label}
                        {active && (
                          <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-pink" />
                        )}
                      </button>
                    </span>
                  );
                })}
              </div>
            </>
          ) : specialistsInMain.length === 0 ? (
            <p className="text-center text-sm text-neutral-300">
              No specialists in this category yet.
            </p>
          ) : (
            <>
              {/* MOBILE: large scrollable text links with vertical dividers */}
              <div
                className="-mx-3 flex items-center gap-4 overflow-x-auto px-3 pl-4 md:hidden [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none' }}
              >
                {specialistsInMain.map((name, idx) => {
                  const active = activeSpecialist === name;
                  return (
                    <Fragment key={name}>
                      {idx > 0 && (
                        <span
                          aria-hidden
                          className="h-5 w-px shrink-0 self-center bg-neutral-300"
                        />
                      )}
                      <button
                        onClick={() => setSpecialist(active ? '' : name)}
                        className={`shrink-0 border-b-2 pb-1 text-lg font-normal whitespace-nowrap transition-all ${
                          active
                            ? 'border-accent-pink text-accent-pink'
                            : 'border-transparent text-slate-400'
                        }`}
                      >
                        {name}
                      </button>
                    </Fragment>
                  );
                })}
              </div>

              {/* DESKTOP: text-link row with pink dots */}
              <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
                {specialistsInMain.map((name, idx) => {
                  const active = activeSpecialist === name;
                  return (
                    <span key={name} className="flex items-center gap-3">
                      {idx > 0 && (
                        <span
                          aria-hidden
                          className="inline-block size-1 rounded-full bg-accent-pink"
                        />
                      )}
                      <button
                        onClick={() => setSpecialist(active ? '' : name)}
                        className={`relative px-1 pb-1 text-base font-medium whitespace-nowrap text-accent-pink transition-opacity ${
                          active
                            ? 'opacity-100'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        {name}
                        {active && (
                          <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-pink" />
                        )}
                      </button>
                    </span>
                  );
                })}
              </div>
            </>
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === 'specialist'
                ? 'Search by specialist…'
                : 'Search by service…'
            }
            className="w-full rounded-xl border-[1.5px] border-slate-150 bg-white px-11 py-3 text-base text-slate-400 shadow-sm transition-colors outline-none focus:border-accent-pink"
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

        {/* Counter + Clear all */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <p className="text-sm text-neutral-300">
            {filtered.length} {filtered.length === 1 ? 'photo' : 'photos'}
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

      {/* ── Full-bleed photo grid ────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-3 pb-4 sm:grid-cols-3 md:gap-4 md:px-6 lg:grid-cols-5">
          {filtered.map((item, idx) => (
            <GalleryGridCell
              key={item.id}
              item={item}
              liked={liked.has(item.id)}
              onLike={toggleLike}
              onOpen={() => setLightboxIndex(idx)}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-20 text-center">
          <p className="text-sm text-neutral-300">
            No portfolio yet for this combination.
          </p>
          <button
            onClick={clearAll}
            className="mt-3 rounded-full bg-fuchsia-500/10 px-5 py-2 text-xs font-bold tracking-wider text-accent-pink uppercase transition-colors hover:bg-fuchsia-500/20"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && lightboxItem && (
        <GalleryLightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          onSelect={setLightboxIndex}
        />
      )}
    </div>
  );
};

export default GalleryPageContent;
