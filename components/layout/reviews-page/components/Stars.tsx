import { Star } from 'lucide-react';
import type { JSX } from 'react';

import { CYAN } from '../constants';

/**
 * Stars — a five-star CYAN rating row ported from the static-html mock
 * (`ReviewsPage.tsx`). Each star is filled with CYAN `#109AA9` while its index
 * is within the rating and left transparent (CYAN outline) otherwise. This is
 * the reviews-page CYAN outline star, distinct from the shared StarsGroup.
 * @param   {object}      props        - Component properties
 * @param   {number}      props.rating - Number of filled stars (1–5)
 * @param   {number}      [props.size] - Icon size in px (default 14)
 * @returns {JSX.Element}              Five-star CYAN rating row
 */
const Stars = ({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number | undefined;
}): JSX.Element => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        fill={i <= rating ? CYAN : 'transparent'}
        stroke={CYAN}
      />
    ))}
  </div>
);

export default Stars;
