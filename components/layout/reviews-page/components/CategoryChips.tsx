import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import { DARK, PINK } from '../constants';
import type { MasterCategory } from '../data';

/**
 * CategoryChips — the mobile-only category filter: a horizontally scrollable row of All/Hair/Face/
 * Body/Nails chips. The active chip uses the PINK brand gradient; only the
 * categories present among the current (salon-filtered) masters are shown.
 * @param   {object}                 props          - Component properties
 * @param   {MasterCategory[]}       props.cats     - Categories available for the current salon
 * @param   {string|null}            props.cat      - Active category (`null` = all)
 * @param   {(c: string|null)=>void} props.onSelect - Select a category (or `null` for all)
 * @returns {JSX.Element}                           Mobile category chips
 */
const CategoryChips = ({
  cats,
  cat,
  onSelect,
}: {
  cats: MasterCategory[];
  cat: string | null;
  onSelect: (c: string | null) => void;
}): JSX.Element => {
  const dict = useDict();
  return (
    <div className="pt-4 lg:hidden">
      <div
        className="-mx-3 flex gap-2 overflow-x-auto px-3 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {(['All', ...cats] as string[]).map((c) => {
          const active = (c === 'All' && !cat) || c === cat;
          return (
            <button
              key={c}
              onClick={() => onSelect(c === 'All' ? null : c)}
              className={`shrink-0 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'bg-gradient-brand text-white'
                  : 'border-[1.5px] border-slate-150 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
              }`}
              style={
                active ? { boxShadow: `0 6px 20px ${PINK}44` } : { color: DARK }
              }
            >
              {c === 'All'
                ? (dict?.all_text?.value as string | undefined) || 'All'
                : c}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
