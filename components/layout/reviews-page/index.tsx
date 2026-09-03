'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

import GridItemAnimations from '@/app/animations/GridItemAnimations';
import RevealAnimations from '@/app/animations/RevealAnimations';
import { useScrollTriggerRefresh } from '@/app/animations/utils/useScrollTriggerRefresh';
import { useDict } from '@/app/store/providers/useDict';
import type {
  MastersMainCategory,
  SalonOption,
} from '@/components/layout/masters-page/taxonomy';
import { MASTERS_MAIN_CATS } from '@/components/layout/masters-page/taxonomy';
import type { ReviewView } from '@/components/layout/reviews-page/types';
import { dictText } from '@/components/utils/dictText';

import CategoryChips from './components/CategoryChips';
import MasterFilter from './components/MasterFilter';
import ReviewCard from './components/ReviewCard';
import SalonFilter from './components/SalonFilter';
import Stars from './components/Stars';
import { INK } from './constants';

/**
 * ReviewsPageContent — the reviews page body: a back link, the "Reviews" heading with an average
 * rating summary, the salon / category / specialist filters and a responsive
 * grid of review cards. Filtering runs client-side over the reviews the server
 * passed in; the CYAN accent is used for ratings/stars while the PINK brand
 * gradient marks active filters and specialist names.
 *
 * Degrades to an empty-state message when no review matches the current filters
 * — and to the same message when the CMS has no reviews at all.
 * @param   {object}        props                 - Component properties
 * @param   {ReviewView[]}  props.reviews         - Reviews from the CMS, newest first
 * @param   {SalonOption[]} props.salons          - Salon filter options
 * @param   {string}        [props.initialMaster] - Specialist to pre-select (e.g. from `?master=`)
 * @returns {JSX.Element}                         Reviews page content
 */
const ReviewsPageContent = ({
  reviews,
  salons,
  initialMaster,
}: {
  reviews: ReviewView[];
  salons: SalonOption[];
  initialMaster?: string | undefined;
}): JSX.Element => {
  const dict = useDict();
  /** Salon of the pre-selected specialist, so `?master=` opens their studio. */
  const initialSalonId =
    reviews.find((review) => review.master === initialMaster)?.salonId ?? null;

  /** Selected salon page id — `null` = all studios. */
  const [salonId, setSalonId] = useState<number | null>(initialSalonId);
  /** Mobile category filter — `null` = all. */
  const [cat, setCat] = useState<MastersMainCategory | null>(null);
  /** Mobile free-text specialist search. */
  const [masterSearch, setMasterSearch] = useState('');
  /** Active specialist name or `All`. */
  const [master, setMaster] = useState<string>(initialMaster ?? 'All');

  /** Reviews of the selected salon (all studios when none is selected). */
  const salonReviews = useMemo(
    () => reviews.filter((review) => !salonId || review.salonId === salonId),
    [reviews, salonId],
  );

  /** Categories present among the current (salon-filtered) reviews. */
  const cats = useMemo(
    () =>
      MASTERS_MAIN_CATS.filter((option) =>
        salonReviews.some((review) => review.category === option.id),
      ),
    [salonReviews],
  );

  /** Specialist pills: narrowed by the category and the search box. */
  const masters = useMemo(() => {
    const query = masterSearch.trim().toLowerCase();
    return Array.from(
      new Set(
        salonReviews
          .filter(
            (review) =>
              review.master &&
              (!cat || review.category === cat) &&
              review.master.toLowerCase().includes(query),
          )
          .map((review) => review.master),
      ),
    ).sort();
  }, [salonReviews, cat, masterSearch]);

  /**
   * Select a salon, dropping a specialist pick that no longer belongs to it.
   * Resetting here (in the event handler) instead of an effect avoids the
   * cascading re-render React warns about.
   * @param   {number | null} id - Salon page id, or `null` for all studios
   * @returns {void}
   */
  const handleSalon = (id: number | null): void => {
    setSalonId(id);
    if (
      master !== 'All' &&
      id &&
      !reviews.some(
        (review) => review.master === master && review.salonId === id,
      )
    ) {
      setMaster('All');
    }
  };

  /**
   * Select a category, dropping a specialist pick outside it.
   * @param   {MastersMainCategory | null} next - Category, or `null` for all
   * @returns {void}
   */
  const handleCat = (next: MastersMainCategory | null): void => {
    setCat(next);
    if (
      master !== 'All' &&
      next &&
      !reviews.some(
        (review) => review.master === master && review.category === next,
      )
    ) {
      setMaster('All');
    }
  };

  /** Reviews matching every active filter. */
  const filtered = useMemo(() => {
    const query = masterSearch.trim().toLowerCase();
    return salonReviews.filter(
      (review) =>
        (!cat || review.category === cat) &&
        (master === 'All' || review.master === master) &&
        (!query || review.master.toLowerCase().includes(query)),
    );
  }, [salonReviews, cat, master, masterSearch]);

  /** Average rating over the filtered set (`—` when empty). */
  const avg = filtered.length
    ? (filtered.reduce((n, r) => n + r.rating, 0) / filtered.length).toFixed(1)
    : '—';

  /** Changing a filter remounts the review grid */
  useScrollTriggerRefresh(filtered);

  return (
    <div className="page-shell" data-testid="reviews-page">
      {/* Back link */}
      <div className="pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} /> {dictText(dict, 'back_text', 'Back')}
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
          {dictText(dict, 'reviews_title', 'Reviews')}
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Stars rating={Math.round(Number(avg))} />
          <span className="text-sm font-bold text-slate-400">{avg}</span>
          <span className="text-sm text-neutral-300">
            · {filtered.length}{' '}
            {filtered.length === 1
              ? dictText(dict, 'reviews_word_singular', 'review')
              : dictText(dict, 'reviews_word_plural', 'reviews')}
          </span>
        </div>
      </RevealAnimations>

      {/* Filters — fade-only reveal (they hold dropdown/scroll controls) */}
      <RevealAnimations fade>
        <SalonFilter salons={salons} salonId={salonId} onSelect={handleSalon} />

        <CategoryChips cats={cats} cat={cat} onSelect={handleCat} />

        <MasterFilter
          masters={masters}
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
          <p className="py-12 text-center text-sm text-neutral-300">
            {dictText(
              dict,
              'no_reviews_specialist_text',
              'No reviews for this specialist yet.',
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewsPageContent;
