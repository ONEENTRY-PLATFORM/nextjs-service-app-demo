'use client';

import type { JSX } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

/**
 * ReviewSlide component displays a single customer review slide.
 *
 * Renders one review — reviewer name, rating stars and review text — centered,
 * matching the `static-html` reference (REVIEWS section on the home page).
 * @param   {object}      props             - Component properties
 * @param   {object}      props.item        - Review data including title, text and rating
 * @param   {string}      props.item.title  - Reviewer name
 * @param   {string}      props.item.text   - Review content text
 * @param   {number}      props.item.rating - Review rating (0-5)
 * @returns {JSX.Element}                   JSX.Element representing a review slide
 */
const ReviewSlide = ({
  item,
}: {
  item: {
    title: string;
    text: string;
    rating: number;
  };
}): JSX.Element => {
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
      <p className="text-base leading-relaxed whitespace-pre-line text-ink">
        {text}
      </p>
    </div>
  );
};

export default ReviewSlide;
