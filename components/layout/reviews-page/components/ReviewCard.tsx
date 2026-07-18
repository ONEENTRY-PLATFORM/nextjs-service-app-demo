import { MessageCircle } from 'lucide-react';
import type { JSX } from 'react';

import { DARK, MUTED, PINK } from '../constants';
import type { Review } from '../data';
import Stars from './Stars';

/**
 * ReviewCard — a single customer review card ported from the static-html mock
 * (`ReviewsPage.tsx`): header with the author (bold DARK), the date (MUTED) and
 * the CYAN {@link Stars}; a justified body; and a footer with the PINK
 * MessageCircle icon and specialist name.
 * @param   {object}      props        - Component properties
 * @param   {Review}      props.review - The review to render
 * @returns {JSX.Element}              Review card
 */
const ReviewCard = ({ review }: { review: Review }): JSX.Element => (
  <div
    data-testid="review-card"
    className="flex h-full flex-col gap-3 rounded-2xl border-[1.5px] border-slate-150 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-bold" style={{ color: DARK }}>
          {review.author}
        </p>
        <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
          {review.date}
        </p>
      </div>
      <Stars rating={review.rating} />
    </div>
    <p
      className="text-justify text-base leading-relaxed"
      style={{ color: DARK }}
    >
      {review.text}
    </p>
    <div className="mt-auto flex items-center gap-1.5 pt-1">
      <MessageCircle size={18} color={PINK} />
      <span className="text-base font-semibold" style={{ color: PINK }}>
        {review.master}
      </span>
    </div>
  </div>
);

export default ReviewCard;
