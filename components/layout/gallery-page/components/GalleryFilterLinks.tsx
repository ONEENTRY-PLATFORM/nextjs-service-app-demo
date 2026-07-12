'use client';

import type { JSX } from 'react';
import { Fragment } from 'react';

/**
 * GalleryFilterLinks — the dynamic sub-row of the gallery filter: large
 * scrollable text links with vertical dividers on mobile and a dot-separated
 * link row on desktop. Shared by the Service (subcategory) and Specialist
 * branches. Clicking the active link clears the pick (toggles to `''`).
 * @param   {object}                  props             - Component properties
 * @param   {readonly string[]}       props.options     - Link labels (subcategories or specialist names)
 * @param   {string}                  props.activeValue - Currently selected label (`''` = none)
 * @param   {(value: string) => void} props.onSelect    - Set the selected label (`''` clears)
 * @returns {JSX.Element}                               Mobile + desktop link rows
 */
const GalleryFilterLinks = ({
  options,
  activeValue,
  onSelect,
}: {
  options: readonly string[];
  activeValue: string;
  onSelect: (value: string) => void;
}): JSX.Element => (
  <>
    {/* MOBILE: large scrollable text links with vertical dividers */}
    <div
      className="-mx-3 flex items-center gap-4 overflow-x-auto px-3 pl-4 md:hidden [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      {options.map((label, idx) => {
        const active = activeValue === label;
        return (
          <Fragment key={label}>
            {idx > 0 && (
              <span
                aria-hidden
                className="h-5 w-px shrink-0 self-center bg-neutral-300"
              />
            )}
            <button
              onClick={() => onSelect(active ? '' : label)}
              className={`shrink-0 border-b-2 pb-1 text-lg font-normal whitespace-nowrap transition-all ${
                active
                  ? 'border-accent-pink text-accent-pink'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {label}
            </button>
          </Fragment>
        );
      })}
    </div>

    {/* DESKTOP: text-link row with pink dots */}
    <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
      {options.map((label, idx) => {
        const active = activeValue === label;
        return (
          <span key={label} className="flex items-center gap-3">
            {idx > 0 && (
              <span
                aria-hidden
                className="inline-block size-1 rounded-full bg-accent-pink"
              />
            )}
            <button
              onClick={() => onSelect(active ? '' : label)}
              className={`relative px-1 pb-1 text-base font-medium whitespace-nowrap text-accent-pink transition-opacity ${
                active ? 'opacity-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              {label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-pink" />
              )}
            </button>
          </span>
        );
      })}
    </div>
  </>
);

export default GalleryFilterLinks;
