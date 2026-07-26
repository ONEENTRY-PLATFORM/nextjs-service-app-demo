import { Search } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import { DARK, MUTED, PINK } from '../constants';
import { MASTER_CAT } from '../data';

/**
 * MasterFilter — the specialist filter: a free-text search input on mobile / small tablet and a
 * centered wrap of specialist pills on desktop. The active pill uses the PINK
 * brand gradient. The desktop pills are additionally narrowed by the current
 * category and search query (both mobile-only inputs, so no-ops on desktop).
 * @param   {object}            props              - Component properties
 * @param   {string[]}          props.masters      - Salon-filtered specialist names
 * @param   {string|null}       props.cat          - Active category (`null` = all)
 * @param   {string}            props.masterSearch - Mobile free-text search value
 * @param   {(v: string)=>void} props.onSearch     - Update the search value
 * @param   {string}            props.master       - Active specialist name or `All`
 * @param   {(m: string)=>void} props.onMaster     - Select a specialist
 * @returns {JSX.Element}                          Specialist filter
 */
const MasterFilter = ({
  masters,
  cat,
  masterSearch,
  onSearch,
  master,
  onMaster,
}: {
  masters: string[];
  cat: string | null;
  masterSearch: string;
  onSearch: (v: string) => void;
  master: string;
  onMaster: (m: string) => void;
}): JSX.Element => {
  const dict = useDict();
  const q = masterSearch.trim().toLowerCase();
  const pills = [
    'All',
    ...masters.filter(
      (m) => (!cat || MASTER_CAT[m] === cat) && m.toLowerCase().includes(q),
    ),
  ];

  return (
    <div className="pt-4 pb-2">
      {/* Mobile + small tablet: search by specialist */}
      <div className="mb-3 flex items-center gap-2 rounded-xl border-[1.5px] border-slate-150 bg-white px-3 py-2.5 lg:hidden">
        <Search size={16} color={MUTED} />
        <input
          value={masterSearch}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={
            (dict?.search_specialist_placeholder?.value as
              string | undefined) || 'Search specialist'
          }
          className="flex-1 bg-transparent text-base text-slate-400 outline-none"
        />
      </div>

      {/* Desktop: centered wrap of specialist pills */}
      <div className="hidden flex-wrap items-center justify-center gap-2 lg:flex">
        {pills.map((m) => {
          const active = master === m;
          return (
            <button
              key={m}
              onClick={() => onMaster(m)}
              className={`rounded-full px-4 py-2 text-base font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-brand text-white'
                  : 'border-[1.5px] border-slate-150 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
              }`}
              style={
                active ? { boxShadow: `0 6px 20px ${PINK}44` } : { color: DARK }
              }
            >
              {m === 'All'
                ? (dict?.all_text?.value as string | undefined) || 'All'
                : m}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MasterFilter;
