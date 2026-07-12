'use client';

import type { JSX } from 'react';

import type { MasterItem } from '../taxonomy';
import MasterCard from './MasterCard';

/**
 * SpecialistSections — the tablet-and-desktop profession card sections
 * (mobile uses the row list instead): each profession group is a centered
 * row of {@link MasterCard}s, separated by soft gradient dividers. Falls back
 * to an empty-state with a "Clear filters" action.
 * @param   {object}         props            - Component properties
 * @param   {MasterItem[][]} props.sections   - Specialists grouped by profession
 * @param   {() => void}     props.onClearAll - Reset every filter
 * @returns {JSX.Element}                     Card sections
 */
const SpecialistSections = ({
  sections,
  onClearAll,
}: {
  sections: MasterItem[][];
  onClearAll: () => void;
}): JSX.Element => (
  <div className="hidden pb-4 md:block">
    {sections.length === 0 ? (
      <div className="mx-auto max-w-7xl px-3 py-16 text-center md:px-8">
        <p className="text-sm text-neutral-300">
          No specialists match the current filter.
        </p>
        <button
          onClick={onClearAll}
          className="mt-3 rounded-full bg-fuchsia-500/10 px-5 py-2 text-xs font-bold tracking-wider text-accent-pink uppercase transition-colors hover:bg-fuchsia-500/20"
        >
          Clear filters
        </button>
      </div>
    ) : (
      sections.map((group, idx) => (
        <section
          key={group[0]?.section ?? String(idx)}
          className="py-5 md:py-7"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-8 px-3 md:gap-12 md:px-8 lg:gap-17.5">
            {group.map((master) => (
              <MasterCard key={master.id} item={master} />
            ))}
          </div>

          {/* Soft divider between profession sections (except last) */}
          {idx < sections.length - 1 && (
            <div
              className="mx-auto mt-5 h-px w-3/5"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #f7f7fb 20%, #f7f7fb 80%, transparent)',
              }}
            />
          )}
        </section>
      ))
    )}
  </div>
);

export default SpecialistSections;
