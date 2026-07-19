'use client';

import { Star } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

/**
 * StarPicker — the 5-star rating picker from the static-html `ReviewModal`:
 * large lucide stars (32px) that fill PINK on hover/selection and scale up
 * slightly on hover; unselected stars are hollow with a DARK outline.
 * @param   {object}                  props        - Component properties
 * @param   {number}                  props.rating - Currently selected rating (0–5)
 * @param   {(value: number) => void} props.onRate - Handler receiving the picked rating
 * @returns {JSX.Element}                          JSX.Element representing the star picker row
 */
const StarPicker = ({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (value: number) => void;
}): JSX.Element => {
  /** Star index currently hovered (0 = none) — previews the rating */
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2, 3, 4, 5].map((i) => {
        const isOn = (hoverRating || rating) >= i;
        return (
          <button
            key={i}
            onClick={() => onRate(i)}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
          >
            <Star
              size={32}
              strokeWidth={1.5}
              fill={isOn ? '#ed21f1' : 'transparent'}
              stroke={isOn ? '#ed21f1' : '#4c4d56'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarPicker;
