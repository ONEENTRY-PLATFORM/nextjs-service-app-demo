'use client';

import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';

import GridItemAnimations from '@/app/animations/GridItemAnimations';
import RevealAnimations from '@/app/animations/RevealAnimations';

import CategoryChips from './components/CategoryChips';
import MasterFilter from './components/MasterFilter';
import ReviewCard from './components/ReviewCard';
import SalonFilter from './components/SalonFilter';
import Stars from './components/Stars';
import { DARK, INK, MUTED } from './constants';
import type { MasterCategory } from './data';
import { MASTER_CAT, MASTER_SALON, REVIEW_SALONS, REVIEWS } from './data';

/** Categories in the mock's fixed display order. */
const CAT_ORDER: readonly MasterCategory[] = ['Hair', 'Face', 'Body', 'Nails'];

/**
 * ReviewsPageContent — the reviews page body ported from the static-html mock
 * (`ReviewsPage.tsx`): a back link, the "Reviews" heading with an average
 * rating summary, the salon / category / specialist filters and a responsive
 * grid of review cards. All filtering runs client-side over the local
 * {@link REVIEWS} data; the CYAN accent is used for ratings/stars while the
 * PINK brand gradient marks active filters and specialist names.
 *
 * Degrades to an empty-state message when no review matches the current
 * filters — never throws over missing data.
 * @param   {object}      props                 - Component properties
 * @param   {string}      [props.initialMaster] - Specialist to pre-select (e.g. from `?master=`)
 * @returns {JSX.Element}                       Reviews page content
 */
const ReviewsPageContent = ({
  initialMaster,
}: {
  initialMaster?: string | undefined;
}): JSX.Element => {
  /** Selected salon id — `null` = all studios. */
  const [salonId, setSalonId] = useState<string | null>(
    initialMaster ? (MASTER_SALON[initialMaster] ?? null) : null,
  );
  /** Mobile category filter — `null` = all. */
  const [cat, setCat] = useState<string | null>(null);
  /** Mobile free-text specialist search. */
  const [masterSearch, setMasterSearch] = useState('');
  /** Active specialist name or `All`. */
  const [master, setMaster] = useState<string>(initialMaster ?? 'All');

  /** Specialists present in the selected salon, sorted. */
  const masters = useMemo(
    () =>
      Array.from(
        new Set(
          REVIEWS.filter(
            (r) => !salonId || MASTER_SALON[r.master] === salonId,
          ).map((r) => r.master),
        ),
      ).sort(),
    [salonId],
  );

  /** Categories present among the current (salon-filtered) masters. */
  const cats = useMemo(
    () => CAT_ORDER.filter((c) => masters.some((m) => MASTER_CAT[m] === c)),
    [masters],
  );

  /**
   * Select a salon, dropping a specialist pick that no longer belongs to it.
   * Resetting here (in the event handler) instead of an effect avoids the
   * cascading re-render React warns about.
   * @param   {string | null} id - Salon id, or `null` for all studios
   * @returns {void}
   */
  const handleSalon = (id: string | null): void => {
    setSalonId(id);
    if (master !== 'All' && id && MASTER_SALON[master] !== id) {
      setMaster('All');
    }
  };

  /**
   * Select a category, dropping a specialist pick outside it.
   * @param   {string | null} next - Category name, or `null` for all
   * @returns {void}
   */
  const handleCat = (next: string | null): void => {
    setCat(next);
    if (master !== 'All' && next && MASTER_CAT[master] !== next) {
      setMaster('All');
    }
  };

  /** Reviews matching every active filter. */
  const filtered = useMemo(() => {
    const q = masterSearch.trim().toLowerCase();
    return REVIEWS.filter(
      (r) =>
        (!salonId || MASTER_SALON[r.master] === salonId) &&
        (!cat || MASTER_CAT[r.master] === cat) &&
        (master === 'All' || r.master === master) &&
        (!q || r.master.toLowerCase().includes(q)),
    );
  }, [salonId, cat, master, masterSearch]);

  /** Average rating over the filtered set (`—` when empty). */
  const avg = filtered.length
    ? (filtered.reduce((n, r) => n + r.rating, 0) / filtered.length).toFixed(1)
    : '—';

  /**
   * Changing a filter remounts the review grid and changes the page height,
   * leaving every ScrollTrigger's cached start/end stale — cards that stay in
   * view can freeze at their hidden entrance state. Recompute trigger positions
   * once the new grid has laid out (next frame), like the services catalog.
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl px-3 md:px-8" data-testid="reviews-page">
      {/* Back link */}
      <div className="pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: DARK }}
        >
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {/* Heading */}
      <RevealAnimations className="pt-8 pb-2 text-center">
        <h1
          className="inline-block border-b border-ink pb-2 font-light uppercase"
          style={{
            color: INK,
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            letterSpacing: '0.08em',
          }}
        >
          Reviews
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Stars rating={Math.round(Number(avg))} />
          <span className="text-sm font-bold" style={{ color: DARK }}>
            {avg}
          </span>
          <span className="text-sm" style={{ color: MUTED }}>
            · {filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </RevealAnimations>

      {/* Filters — fade-only reveal (they hold dropdown/scroll controls) */}
      <RevealAnimations fade>
        <SalonFilter
          salons={REVIEW_SALONS}
          salonId={salonId}
          onSelect={handleSalon}
        />

        <CategoryChips cats={cats} cat={cat} onSelect={handleCat} />

        <MasterFilter
          masters={masters}
          cat={cat}
          masterSearch={masterSearch}
          onSearch={setMasterSearch}
          master={master}
          onMaster={setMaster}
        />
      </RevealAnimations>

      {/* Review cards */}
      <div className="py-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((r, index) => (
            <GridItemAnimations key={r.id} index={index} className="h-full">
              <ReviewCard review={r} />
            </GridItemAnimations>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm" style={{ color: MUTED }}>
            No reviews for this specialist yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewsPageContent;
