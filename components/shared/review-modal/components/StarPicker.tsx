'use client';

import { Star } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import { useDict } from '@/app/store/providers/useDict';

/**
 * StarPicker — the 5-star rating picker:
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
  const dict = useDict();
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
            aria-label={(
              (dict?.rate_star_aria?.value as string | undefined) ||
              'Rate %n% star(s)'
            ).replace('%n%', String(i))}
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
