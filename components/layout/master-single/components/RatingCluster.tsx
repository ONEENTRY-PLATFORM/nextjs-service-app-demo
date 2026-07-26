'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import { useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import ReviewModal from '@/components/shared/review-modal';
import StarsGroup from '@/components/shared/StarsGroup';

/**
 * RatingCluster component — stars, a reviews counter and a "Leave a review"
 * button.
 *
 * CYAN stars (14px) followed by the review count and the word "Reviews" (a link to the reviews page filtered to
 * this specialist, underlined on hover), then a PINK underlined "Leave a
 * review" button that opens the in-page {@link ReviewModal}.
 * @param   {object}      props              - Component properties.
 * @param   {number}      props.rating       - Rating value (0–5).
 * @param   {number}      props.reviewsCount - Number of reviews for this specialist.
 * @param   {string}      props.masterName   - Specialist name (pre-selects the reviews-page filter).
 * @returns {JSX.Element}                    JSX.Element representing the rating cluster.
 */
const RatingCluster = ({
  rating,
  reviewsCount,
  masterName,
}: {
  rating: number;
  reviewsCount: number;
  masterName: string;
}): JSX.Element => {
  const dict = useDict();
  /** Whether the review modal is open */
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
      <Link
        href={
          masterName
            ? `/reviews?master=${encodeURIComponent(masterName)}`
            : '/reviews'
        }
        className="group flex items-center gap-1.5"
      >
        <StarsGroup rating={rating} size={14} />
        <span className="text-sm text-slate-400 underline-offset-2 group-hover:underline">
          {reviewsCount}
        </span>
        <span className="text-sm text-neutral-300 underline-offset-2 group-hover:underline">
          {(dict?.reviews_label?.value as string | undefined) || 'Reviews'}
        </span>
      </Link>
      <button
        onClick={() => setReviewOpen(true)}
        data-testid="master-leave-review"
        className="text-base font-bold text-fuchsia-500 underline underline-offset-2 transition-opacity hover:opacity-70"
      >
        {(dict?.leave_review_text?.value as string | undefined) ||
          'Leave a review'}
      </button>
      {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} />}
    </div>
  );
};

export default RatingCluster;
