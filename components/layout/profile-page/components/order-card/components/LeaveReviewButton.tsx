'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import ReviewModal from '@/components/shared/review-modal';
import { dictText } from '@/components/utils/dictText';

/**
 * LeaveReviewButton — the gradient "Leave a review" action on completed
 * visits. Opens the shared {@link ReviewModal} (rating picker, photos, text),
 * which files the review against the specialist of that visit.
 * @param   {object}      props          - Component properties
 * @param   {number}      props.masterId - Admin id of the specialist who served the visit
 * @returns {JSX.Element}                JSX.Element representing the leave-a-review action
 */
const LeaveReviewButton = ({ masterId }: { masterId: number }): JSX.Element => {
  const dict = useDict();

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
        {dictText(dict, 'leave_review_text', 'Leave a review')}
      </button>
      {reviewOpen && (
        <ReviewModal masterId={masterId} onClose={() => setReviewOpen(false)} />
      )}
    </>
  );
};

export default LeaveReviewButton;
