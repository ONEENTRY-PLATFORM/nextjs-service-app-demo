'use client';

import type { JSX } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

/**
 * ReviewSlideItem — one review as the home slider renders it.
 * @property {string} id     - Review record id, used as the slide key
 * @property {string} title  - Reviewer name
 * @property {string} text   - Review body
 * @property {number} rating - Star rating, 0–5
 */
export type ReviewSlideItem = {
  id: string;
  title: string;
  text: string;
  rating: number;
};

/**
 * ReviewSlide component displays a single customer review slide.
 *
 * Renders one review — reviewer name, rating stars and review text — centered.
 * @param   {object}          props      - Component properties
 * @param   {ReviewSlideItem} props.item - Review data including title, text and rating
 * @returns {JSX.Element}                JSX.Element representing a review slide
 */
const ReviewSlide = ({ item }: { item: ReviewSlideItem }): JSX.Element => {
  /** Destructure title, text and rating from the review item */
  const { title, text, rating } = item;

  return (
    <div key={title} className="slide review-fade px-2 text-center">
      {/** Reviewer name */}
      <p className="mb-1 text-lg font-bold text-ink">{title}</p>
      {/** Rating stars — centered */}
      <div className="mb-4 flex justify-center">
        <StarsGroup rating={rating} size={14} />
      </div>
      {/** Review text */}
      <p className="text-[clamp(0.875rem,1.2vw,1rem)] leading-relaxed whitespace-pre-line text-ink">
        {text}
      </p>
    </div>
  );
};

export default ReviewSlide;
