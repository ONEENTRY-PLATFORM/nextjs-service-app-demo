'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import ReviewModal from '@/components/shared/review-modal';

/**
 * LeaveReviewButton — the gradient "Leave a review" action on completed
 * visits, as in the static-html mock (`AccountPage.tsx`). Opens the shared
 * {@link ReviewModal} (rating picker, photos, text) which thanks the visitor
 * on confirm.
 * @returns {JSX.Element} JSX.Element representing the leave-a-review action
 */
const LeaveReviewButton = (): JSX.Element => {
  /** Whether the review modal is open */
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setReviewOpen(true)}
        data-testid="order-leave-review"
        className="flex-1 rounded-lg bg-gradient-brand py-1.5 text-base font-bold text-white transition-all hover:opacity-90"
      >
        Leave a review
      </button>
      {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} />}
    </>
  );
};

export default LeaveReviewButton;
