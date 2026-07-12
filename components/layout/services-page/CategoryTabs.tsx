'use client';

import type { JSX } from 'react';
import { Fragment } from 'react';

import { DARK, MUTED, PINK, PINK2 } from './constants';
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

  return (
    <>
      {/* Main category chips — mobile: scrollable row. Desktop: centered */}
      <div
        className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:justify-center md:px-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((c) => {
          const active = mainCat === c.url;
          return (
            <button
              key={c.url}
              onClick={() => onMain(c.url)}
              className="flex min-w-28 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-all duration-200 active:scale-96 md:min-w-0 md:px-5"
              style={{
                background: active
                  ? `linear-gradient(135deg,${PINK2},${PINK})`
                  : '#fff',
                color: active ? '#fff' : DARK,
                boxShadow: active
                  ? `0 6px 20px ${PINK}44`
                  : '0 2px 8px rgba(0,0,0,0.06)',
                border: active ? 'none' : '1.5px solid #e8e8f0',
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

      {/* Subcategory — MOBILE: large scrollable text links with dividers */}
      {subCats.length > 0 && (
        <div
          className="-mx-3 mt-4 mb-5 flex items-center gap-4 overflow-x-auto px-4 md:hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {subCats.map((sub, index) => {
            const active = sub.url === subCat;
            return (
              <Fragment key={sub.url}>
                {index > 0 && (
                  <span
                    aria-hidden
                    className="h-5 w-px shrink-0 self-center"
                    style={{ background: MUTED }}
                  />
                )}
                <button
                  onClick={() => onSub(sub.url)}
                  className="shrink-0 pb-1 text-lg font-normal whitespace-nowrap transition-all"
                  style={{
                    color: active ? PINK : DARK,
                    borderBottom: active
                      ? `2px solid ${PINK}`
                      : '2px solid transparent',
                  }}
                >
                  {sub.title}
                </button>
              </Fragment>
            );
          })}
        </div>
      )}

      {/* Subcategory tabs — DESKTOP: text links separated by pink dots */}
      {subCats.length > 0 && (
        <div className="my-6 hidden flex-wrap items-center justify-center gap-2 md:flex">
          {subCats.map((sub, index) => {
            const active = sub.url === subCat;
            return (
              <div key={sub.url} className="flex items-center gap-3">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="inline-block rounded-full"
                    style={{ width: 4, height: 4, background: PINK }}
                  />
                )}
                <button
                  onClick={() => onSub(sub.url)}
                  className="relative px-1 pb-1 text-base font-medium transition-opacity"
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
                  {active && (
                    <span
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full"
                      style={{ background: PINK }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CategoryTabs;
