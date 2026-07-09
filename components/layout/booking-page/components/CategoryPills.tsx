'use client';

import type { JSX } from 'react';

import { BRAND_GRADIENT, MUTED, PINK } from '../constants';

/**
 * CategoryPills — the horizontal category filter row shared by the Service
 * and Specialist steps (mock `BookingPage.tsx` → category pills): scrollable
 * on mobile, wrapping on desktop, the active pill filled with the brand
 * gradient.
 * @param   {object}                props            - Component properties
 * @param   {string[]}              props.categories - Pill labels in display order
 * @param   {string}                props.active     - Currently active pill
 * @param   {(cat: string) => void} props.onChange   - Activate a pill
 * @returns {JSX.Element}                            Category pills row
 */
const CategoryPills = ({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}): JSX.Element => {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      {categories.map((c) => {
        const isActive = active === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="flex min-w-28 shrink-0 items-center justify-center rounded-full px-6 py-2.5 text-base font-medium whitespace-nowrap transition-all duration-200 md:min-w-0 md:px-4 md:py-1.5"
            style={{
              background: isActive ? BRAND_GRADIENT : '#f7f7fb',
              color: isActive ? '#fff' : MUTED,
              boxShadow: isActive ? `0 4px 12px ${PINK}44` : 'none',
            }}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
