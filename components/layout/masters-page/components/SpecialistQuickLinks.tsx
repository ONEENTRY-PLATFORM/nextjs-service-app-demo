'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import type { MasterItem } from '../taxonomy';

/**
 * SpecialistQuickLinks — the desktop inline dot-separated row of specialist
 * name links for the active category. Names without a profile page render as
 * plain text. Shows a placeholder line when the category is empty.
 * @param   {object}       props         - Component properties
 * @param   {MasterItem[]} props.masters - Specialists in the active category
 * @returns {JSX.Element}                Quick links row
 */
const SpecialistQuickLinks = ({
  masters,
}: {
  masters: MasterItem[];
}): JSX.Element => {
  const dict = useDict();

  return (
    <div className="mt-5 hidden flex-wrap items-center justify-center gap-2 lg:flex">
      {masters.length === 0 ? (
        <span className="text-xs text-neutral-300">
          {(dict?.no_specialists_category_text?.value as string | undefined) ||
            'No specialists in this category yet.'}
        </span>
      ) : (
        masters.map((master, idx) => (
          <span key={master.id} className="flex items-center gap-3">
            {idx > 0 && (
              <span
                aria-hidden
                className="inline-block size-1 rounded-full bg-accent-pink"
              />
            )}
            {master.href ? (
              <Link
                href={master.href}
                className="px-1 pb-1 text-base font-medium whitespace-nowrap text-accent-pink underline-offset-4 opacity-75 transition-opacity hover:underline hover:opacity-100"
              >
                {master.name}
              </Link>
            ) : (
              <span className="px-1 pb-1 text-base font-medium whitespace-nowrap text-accent-pink opacity-75">
                {master.name}
              </span>
            )}
          </span>
        ))
      )}
    </div>
  );
};

export default SpecialistQuickLinks;
