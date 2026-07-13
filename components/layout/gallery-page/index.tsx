'use client';

import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { GalleryTab } from './components/GalleryFilterBar';
import GalleryFilterBar from './components/GalleryFilterBar';
import GalleryGridCell from './components/GalleryGridCell';
import GalleryLightbox from './components/GalleryLightbox';
import type { GalleryItem, GalleryMainCategory } from './taxonomy';
import { GALLERY_SUBCATEGORIES, SUB_TO_MAIN } from './taxonomy';

/**
 * GalleryPageContent — the gallery page body ported from the static-html
 * mock (`GalleryPage.tsx`): the filter block ({@link GalleryFilterBar}), the
 * full-bleed photo grid and a lightbox.
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

  const [tab, setTab] = useState<GalleryTab>('service');
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

  /**
   * Subcategory chips of the current main category, narrowed to those that
   * actually have photos. The CMS gallery tags photos at the main-category
   * level only, so its items carry no price-list subcategory — the chip row is
   * then empty and the Service tab simply shows every photo in the category
   * (with the local scanner's richer data the present subcategories still show).
   */
  const subCats = useMemo(() => {
    const present = new Set(
      items
        .filter((item) => SUB_TO_MAIN[item.category] === mainCat)
        .map((item) => item.category),
    );
    return GALLERY_SUBCATEGORIES[mainCat].filter((sub) => present.has(sub));
  }, [items, mainCat]);

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
      <GalleryFilterBar
        tab={tab}
        onTab={setTab}
        mainCat={mainCat}
        onMainCat={setMainCat}
        subCats={subCats}
        activeSubCat={activeSubCat}
        onSubCat={setSubCat}
        specialistsInMain={specialistsInMain}
        activeSpecialist={activeSpecialist}
        onSpecialist={setSpecialist}
        query={query}
        onQuery={setQuery}
        count={filtered.length}
        hasActiveFilter={hasActiveFilter}
        onClearAll={clearAll}
      />

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
