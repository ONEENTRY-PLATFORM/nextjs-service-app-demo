import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import type { MastersMainCategory } from '@/components/layout/masters-page/taxonomy';
import { dictText } from '@/components/utils/dictText';

import { DARK, PINK } from '../constants';

/**
 * CategoryChips — the mobile-only category filter: a horizontally scrollable row of All/Hair/Face/
 * Body/Nails chips. The active chip uses the PINK brand gradient; only the
 * categories present among the current (salon-filtered) reviews are shown.
 * @param   {object}                                     props          - Component properties
 * @param   {{id: MastersMainCategory, label: string}[]} props.cats     - Categories available for the current salon
 * @param   {MastersMainCategory|null}                   props.cat      - Active category (`null` = all)
 * @param   {(c: MastersMainCategory|null)=>void}        props.onSelect - Select a category (or `null` for all)
 * @returns {JSX.Element}                                               Mobile category chips
 */
const CategoryChips = ({
  cats,
  cat,
  onSelect,
}: {
  cats: { id: MastersMainCategory; label: string }[];
  cat: MastersMainCategory | null;
  onSelect: (c: MastersMainCategory | null) => void;
}): JSX.Element => {
  const dict = useDict();
  return (
    <div className="pt-4 lg:hidden">
      <div
        className="-mx-3 flex gap-2 overflow-x-auto px-3 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {[{ id: null, label: dictText(dict, 'all_text', 'All') }, ...cats].map(
          ({ id, label }) => {
            const active = id === cat;
            return (
              <button
                key={id ?? 'all'}
                onClick={() => onSelect(id)}
                className={`shrink-0 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-gradient-brand text-white'
                    : 'border-[1.5px] border-slate-150 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                }`}
                style={
                  active
                    ? { boxShadow: `0 6px 20px ${PINK}44` }
                    : { color: DARK }
                }
              >
                {label}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
};

export default CategoryChips;
