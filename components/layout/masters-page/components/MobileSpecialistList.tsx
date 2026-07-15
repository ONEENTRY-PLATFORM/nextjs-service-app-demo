'use client';

import { ChevronRight, Search, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';

import type { MasterItem } from '../taxonomy';

/** Shared row shell of a compact specialist entry */
const ROW_CLASS =
  'flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-slate-150 bg-white px-3 py-3 text-left shadow-sm';

/**
 * MobileSpecialistList — the mobile-and-tablet specialist search field plus the
 * mobile-only compact row list (the tablet keeps the photo cards, narrowed by
 * this same search). Rows link to a profile when one exists.
 * @param   {object}              props         - Component properties
 * @param   {string}              props.query   - Free-text search value
 * @param   {(v: string) => void} props.onQuery - Set the search value
 * @param   {MasterItem[]}        props.masters - Specialists after all filters
 * @returns {JSX.Element}                       Search field + row list
 */
const MobileSpecialistList = ({
  query,
  onQuery,
  masters,
}: {
  query: string;
  onQuery: (v: string) => void;
  masters: MasterItem[];
}): JSX.Element => (
  <div className="mt-4 lg:hidden">
    <div className="relative mb-3">
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-300"
      />
      <input
        type="text"
        data-testid="masters-search-input"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search specialist"
        className="w-full rounded-xl border-[1.5px] border-slate-150 bg-white py-2.5 pr-10 pl-9 text-base text-slate-400 transition-colors outline-none focus:border-accent-pink"
      />
      {query.trim() && (
        <button
          onClick={() => onQuery('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-300"
        >
          <X size={16} />
        </button>
      )}
    </div>

    {/* Compact specialist row list — mobile only */}
    <div className="space-y-2 md:hidden">
      {masters.length === 0 ? (
        <p
          data-testid="masters-rows-empty"
          className="py-4 text-center text-sm text-neutral-300"
        >
          No specialists found.
        </p>
      ) : (
        masters.map((master) => {
          const row = (
            <>
              {master.photo ? (
                <Image
                  src={master.photo}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 shrink-0 rounded-full border-2 border-fuchsia-500/20 object-cover object-top"
                />
              ) : (
                <span className="size-12 shrink-0 rounded-full border-2 border-fuchsia-500/20 bg-slate-50" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-slate-400">
                  {master.name}
                </span>
                <span className="block truncate text-sm text-neutral-300">
                  {master.role}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-slate-400">
                <Star size={18} className="fill-accent-cyan text-accent-cyan" />{' '}
                {master.rating.toFixed(1)}
              </span>
              <ChevronRight size={18} className="shrink-0 text-neutral-300" />
            </>
          );
          return master.href ? (
            <Link
              key={master.id}
              prefetch={false}
              href={master.href}
              data-testid="master-row"
              data-master-id={master.id}
              className={ROW_CLASS}
            >
              {row}
            </Link>
          ) : (
            <div
              key={master.id}
              data-testid="master-row"
              data-master-id={master.id}
              className={ROW_CLASS}
            >
              {row}
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default MobileSpecialistList;
