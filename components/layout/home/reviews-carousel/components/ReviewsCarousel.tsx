'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { reviewsData } from '@/components/data/reviewsData';

import ReviewsAnimations from '../animations/ReviewsAnimations';
import ReviewSlide from './ReviewSlide';

/** Brand pink (`--color-accent-pink`) for the active dot background. */
const PINK = '#ed21f1';
/** Autoplay interval in milliseconds. */
const AUTOPLAY_DELAY = 5000;

/**
 * ReviewsCarousel
 *
 * Index-based single-review slider matching the `static-html` reference:
 * a centered review that fades on change, desktop side arrows, and a row of
 * dots (flanked by prev/next arrows on mobile). Autoplays and pauses on hover.
 * @returns {JSX.Element} React component that renders the reviews slider
 */
const ReviewsCarousel = (): JSX.Element => {
  /** Index of the currently displayed review */
  const [index, setIndex] = useState(0);
  /** Whether autoplay is paused (e.g. while hovering) */
  const [paused, setPaused] = useState(false);

  /** Total number of reviews */
  const total = reviewsData.length;

  /** Show the previous review, wrapping around */
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total],
  );
  /** Show the next review, wrapping around */
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  /** Advance the slider automatically unless paused or there is nothing to rotate */
  useEffect(() => {
    if (paused || total <= 1) {
      return;
    }
    const timer = setInterval(next, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [paused, total, next]);

  /** Nothing to render when there are no reviews */
  if (total === 0) {
    return <></>;
  }

  /** Currently active review (guarded index access for noUncheckedIndexedAccess) */
  const current = reviewsData[index] ?? reviewsData[0];
  if (!current) {
    return <></>;
  }

  return (
    <ReviewsAnimations className="w-full max-w-3xl">
      <div
        className="relative px-4 md:px-16"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/** Left arrow — desktop only (thin chevron, matches static-html) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous review"
          className="arrow absolute top-1/2 left-4 hidden -translate-y-1/2 text-accent-pink transition-opacity hover:opacity-70 md:block"
        >
          <svg width="22" height="42" viewBox="0 0 25.6872 44.5" fill="none">
            <path
              d="M24.1871 1.50002L2.18714 21L24.1871 43"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        </button>

        {/** Active review */}
        <ReviewSlide key={index} item={current} />

        {/** Dots — with prev/next arrows on mobile */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous review"
            className="text-accent-pink transition-opacity hover:opacity-70 md:hidden"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            {reviewsData.map((item, i) => (
              <button
                type="button"
                key={item.title}
                onClick={() => setIndex(i)}
                aria-label={`Go to review ${i + 1}`}
                className="size-2 rounded-full transition-all"
                style={{
                  background: i === index ? PINK : '#ddd',
                  transform: i === index ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next review"
            className="text-accent-pink transition-opacity hover:opacity-70 md:hidden"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/** Right arrow — desktop only (thin chevron, matches static-html) */}
        <button
          type="button"
          onClick={next}
          aria-label="Next review"
          className="arrow absolute top-1/2 right-4 hidden -translate-y-1/2 rotate-180 text-accent-pink transition-opacity hover:opacity-70 md:block"
        >
          <svg width="22" height="42" viewBox="0 0 25.6872 44.5" fill="none">
            <path
              d="M24.1871 1.50002L2.18714 21L24.1871 43"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        </button>
      </div>

      {/** View all reviews → Reviews page */}
      <div className="mt-6 flex justify-center md:mt-10">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1.5 text-base font-bold tracking-wider text-accent-pink uppercase underline decoration-accent-pink underline-offset-4 transition-opacity hover:opacity-70"
        >
          View all reviews
        </Link>
      </div>
    </ReviewsAnimations>
  );
};

export default ReviewsCarousel;
