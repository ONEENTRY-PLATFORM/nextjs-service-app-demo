import type { JSX } from 'react';

import StarIcon from '@/components/icons/star';
import StarOpenIcon from '@/components/icons/star-o';

/**
 * StarsGroup component displays a rating using star icons.
 *
 * This component renders a group of 5 stars with a specified number filled
 * based on the rating value. Commonly used for displaying product or service ratings.
 * The component uses two different star icons - a filled star for the rating value
 * and an outlined star for the remaining stars.
 * @param   {object}      props         - Component properties
 * @param   {number}      props.rating  - Rating value (number of filled stars) between 0 and 5
 * @param   {number}      props.size    - Size of each star icon in pixels
 * @param   {string}      [props.color] - Fill colour of filled stars (default CYAN `#109AA9`; e.g. PINK on the profile visit card)
 * @returns {JSX.Element}               representing a group of stars with the specified rating
 */
const StarsGroup = ({
  rating,
  size,
  color,
}: {
  rating: number;
  size: number;
  color?: string;
}): JSX.Element => {
  const totalRating = 5;

  return (
    <div
      className="flex gap-1"
      aria-label={`Rating of ${rating} out of ${totalRating}`}
    >
      {Array.from({ length: totalRating }, (_, index) => {
        return index < rating ? (
          <StarIcon
            key={index}
            size={size}
            {...(color !== undefined ? { color } : {})}
          />
        ) : (
          <StarOpenIcon
            key={index}
            size={size}
            {...(color !== undefined ? { color } : {})}
          />
        );
      })}
    </div>
  );
};

export default StarsGroup;
