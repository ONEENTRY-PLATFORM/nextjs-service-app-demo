'use client';

import type { JSX } from 'react';

import UnderlineFlow from '@/app/animations/UnderlineFlow';

import { DARK, PINK, PINK2 } from './constants';
import type { ServicesCategory } from './types';

/**
 * CategoryTabs — the main category chips (scrollable row on mobile, centered
 * wrap on desktop) and the subcategory tabs of the active category (large text
 * links with dividers on mobile, dot-separated links on desktop). Hidden by
 * the parent while a search query is active.
 * @param   {object}                props            - Component properties
 * @param   {ServicesCategory[]}    props.categories - Service categories with subcategories
 * @param   {string | null}         props.mainCat    - Active category `pageUrl`
 * @param   {string | null}         props.subCat     - Active subcategory `pageUrl`
 * @param   {(url: string) => void} props.onMain     - Switch the main category
 * @param   {(url: string) => void} props.onSub      - Switch the subcategory
 * @returns {JSX.Element}                            Category and subcategory tabs
 */
const CategoryTabs = ({
  categories,
  mainCat,
  subCat,
  onMain,
  onSub,
}: {
  categories: ServicesCategory[];
  mainCat: string | null;
  subCat: string | null;
  onMain: (url: string) => void;
  onSub: (url: string) => void;
}): JSX.Element => {
  /** Subcategories of the currently selected category */
  const subCats =
    categories.find((c) => c.url === mainCat)?.subcategories ?? [];
  /** Position of the active subcategory — where the flowing underline rests */
  const subIndex = subCats.findIndex((sub) => sub.url === subCat);
  const activeSub = subIndex < 0 ? null : subIndex;

  return (
    <>
      {/* Main category chips — mobile: centered scrollable row. Desktop: centered */}
      <div
        className="-mx-3 -mt-5 -mb-2 overflow-x-auto px-3 py-5 md:mx-0 md:mt-0 md:mb-3 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="mx-auto flex w-max gap-2 md:w-full md:flex-wrap md:justify-center">
          {categories.map((c) => {
            const active = mainCat === c.url;
            return (
              <button
                key={c.url}
                onClick={() => onMain(c.url)}
                data-testid="services-category-tab"
                data-cat-url={c.url}
                data-active={active ? 'true' : 'false'}
                className="flex min-w-28 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-all duration-200 active:scale-96 md:min-w-0 md:px-5"
                style={{
                  background: active
                    ? `linear-gradient(135deg,${PINK2},${PINK})`
                    : '#fff',
                  color: active ? '#fff' : DARK,
                  boxShadow: active
                    ? `0 6px 20px ${PINK}44`
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  border: active
                    ? '1.5px solid transparent'
                    : '1.5px solid #e8e8f0',
                }}
                onMouseEnter={(e) => {
                  if (active) {
                    return;
                  }
                  e.currentTarget.style.background = `${PINK}11`;
                  e.currentTarget.style.color = PINK;
                  e.currentTarget.style.borderColor = `${PINK}55`;
                }}
                onMouseLeave={(e) => {
                  if (active) {
                    return;
                  }
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = DARK;
                  e.currentTarget.style.borderColor = '#e8e8f0';
                }}
              >
                {c.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory — MOBILE: large scrollable text links with bar dividers */}
      {subCats.length > 0 && (
        <div
          className="-mx-3 mt-4 mb-5 overflow-x-auto px-4 md:hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="mx-auto w-max">
            <UnderlineFlow
              active={activeSub}
              className="flex items-center gap-8"
            >
              {subCats.map((sub) => (
                <button
                  key={sub.url}
                  onClick={() => onSub(sub.url)}
                  className="relative shrink-0 pb-1 text-lg font-normal whitespace-nowrap transition-colors before:absolute before:top-1/2 before:-left-4 before:h-5 before:w-px before:-translate-y-1/2 before:bg-neutral-300 before:content-[''] first:before:hidden"
                  style={{ color: sub.url === subCat ? PINK : DARK }}
                >
                  {sub.title}
                </button>
              ))}
            </UnderlineFlow>
          </div>
        </div>
      )}

      {/* Subcategory tabs — DESKTOP: text links separated by pink dots */}
      {subCats.length > 0 && (
        <div className="my-6 hidden md:block">
          <UnderlineFlow
            active={activeSub}
            className="flex flex-wrap items-center justify-center gap-8"
          >
            {subCats.map((sub) => {
              const active = sub.url === subCat;
              return (
                <button
                  key={sub.url}
                  onClick={() => onSub(sub.url)}
                  className="relative px-1 pb-1 text-base font-medium transition-opacity before:absolute before:top-1/2 before:-left-4 before:size-1 before:-translate-y-1/2 before:rounded-full before:bg-fuchsia-500 before:content-[''] first:before:hidden"
                  style={{ color: PINK, opacity: active ? 1 : 0.65 }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.opacity = '0.65';
                    }
                  }}
                >
                  {sub.title}
                </button>
              );
            })}
          </UnderlineFlow>
        </div>
      )}
    </>
  );
};

export default CategoryTabs;
