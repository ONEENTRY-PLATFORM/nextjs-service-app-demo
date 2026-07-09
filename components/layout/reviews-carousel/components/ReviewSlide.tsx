/* eslint-disable jsdoc/reject-function-type */
'use client';

import type { Dispatch, JSX, SetStateAction } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

/**
 * ReviewSlide component displays a single customer review slide.
 *
 * This component renders a review with title, rating stars, and review text.
 * It's designed to be used within a carousel to showcase customer testimonials.
 * @param   {object}      props             - Component properties
 * @param   {object}      props.item        - Review data including title, text, and rating
 * @param   {string}      props.item.title  - Review title
 * @param   {string}      props.item.text   - Review content text
 * @param   {number}      props.item.rating - Review rating (0-5)
 * @param   {Function}    props.setState    - State setter function (currently unused)
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
  setState: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  /** Destructure title, text, and rating from the review item */
  const { title, text, rating } = item;

  return (
    <div className="slide relative box-border flex w-235 max-w-full flex-col pb-7 max-lg:w-[75vw]">
      <div className="relative mx-auto mt-5 box-border h-auto text-center max-sm:mb-2.5">
        <h3 className="bg-white text-start text-xl font-bold text-neutral-600 not-italic">
          {title}
        </h3>
      </div>
      <div className="mx-auto">
        <StarsGroup rating={rating} size={16} />
      </div>
      <div className="flex w-full px-4 text-center">
        <p className="text-neutral-800">{text}</p>
      </div>
    </div>
  );
};

export default ReviewSlide;
