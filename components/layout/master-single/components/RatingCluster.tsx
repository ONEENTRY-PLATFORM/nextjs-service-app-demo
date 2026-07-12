import Link from 'next/link';
import type { JSX } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

/**
 * RatingCluster component — star rating plus a "Leave a review" link.
 *
 * Shows the master's rating as CYAN stars (via the shared `StarsGroup`) next to
 * a PINK underlined link to the reviews page. Matches the reference header
 * cluster; there is no in-page review modal.
 * @param   {object}      props        - Component properties.
 * @param   {number}      props.rating - Rating value (0–5).
 * @returns {JSX.Element}              JSX.Element representing the rating cluster.
 */
const RatingCluster = ({ rating }: { rating: number }): JSX.Element => {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
      <StarsGroup rating={rating} size={16} />
      <Link
        href="/reviews"
        className="text-base font-bold text-fuchsia-500 underline underline-offset-2 transition-opacity hover:opacity-70"
      >
        Leave a review
      </Link>
    </div>
  );
};

export default RatingCluster;
