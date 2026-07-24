'use client';

import { Search, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';

import GridItemAnimations from '@/app/animations/GridItemAnimations';
import RevealAnimations from '@/app/animations/RevealAnimations';
import { useScrollTriggerRefresh } from '@/app/animations/utils/useScrollTriggerRefresh';
import { useDict } from '@/app/store/providers/useDict';

import CategoryTabs from './CategoryTabs';
import { DARK, MUTED, PINK } from './constants';
import SalonSelector from './SalonSelector';
import ServiceCard from './ServiceCard';
import type { ServiceItem, ServicesCategory, ServicesSalon } from './types';

/**
 * ServicesCatalog component — the interactive part of the services page as in
 * the static-html mock (`PricesPage.tsx`): salon selector (cards on desktop,
 * dropdown on mobile — {@link SalonSelector}), free-text service search,
 * category and subcategory tabs ({@link CategoryTabs}) and the responsive grid
 * of service cards.
 *
 * All data comes pre-fetched from the server as plain arrays; every section
 * degrades gracefully while the CMS is not filled yet — an empty salons list
 * hides the selector, no categories means the chips row is not rendered and
 * the grid shows everything the CMS has.
 *
 * When rendered on a category deep-link (`/services/hair`) the parent passes
 * `initialCategory`/`initialSubcategory` to pre-select the matching tab, exactly
 * like `PricesPage`'s `initialCategory` in the static-html mock.
 * @param   {object}             props                      - Component properties
 * @param   {ServicesCategory[]} props.categories           - Service categories with their subcategories
 * @param   {ServicesSalon[]}    props.salons               - Salon locations for the selector
 * @param   {ServiceItem[]}      props.services             - Flat list of all services
 * @param   {string}             [props.initialCategory]    - `pageUrl` of the category to pre-select
 * @param   {string}             [props.initialSubcategory] - `pageUrl` of the subcategory to pre-select
 * @returns {JSX.Element}                                   Interactive services catalog section
 */
const ServicesCatalog = ({
  categories,
  salons,
  services,
  initialCategory,
  initialSubcategory,
}: {
  categories: ServicesCategory[];
  salons: ServicesSalon[];
  services: ServiceItem[];
  initialCategory?: string | undefined;
  initialSubcategory?: string | undefined;
}): JSX.Element => {
  const dict = useDict();
  const firstCategory = categories[0];
  /** Pre-selected category — the deep-linked one when valid, else the first */
  const startCat =
    initialCategory && categories.some((c) => c.url === initialCategory)
      ? initialCategory
      : (firstCategory?.url ?? null);
  /** Pre-selected subcategory — the deep-linked one when valid, else the first */
  const startCatEntry = categories.find((c) => c.url === startCat);
  const startSub =
    initialSubcategory &&
    startCatEntry?.subcategories.some((s) => s.url === initialSubcategory)
      ? initialSubcategory
      : (startCatEntry?.subcategories[0]?.url ?? null);
  const [mainCat, setMainCat] = useState<string | null>(startCat);
  const [subCat, setSubCat] = useState<string | null>(startSub);
  /** Selected salon `pageUrl`; `null` = All studios */
  const [salon, setSalon] = useState<string | null>(salons[0]?.url ?? null);
  /**
   * Numeric id of the selected salon, `null` for "All studios" — what a "Book"
   * click carries into the booking cart so the wizard preselects this studio.
   */
  const selectedSalonId = salons.find((s) => s.url === salon)?.id ?? null;
  /** Free-text service search */
  const [query, setQuery] = useState('');

  /**
   * Mirror the current tab selection in the address bar as `/services/{handle}`
   * via the History API, so the category is shareable and bookmarkable without
   * a real navigation — the catalog stays mounted, keeping the salon selection
   * and scroll position. `handle` is a category (`hair`) or subcategory
   * (`haircut`) `pageUrl`; both are real static routes that re-derive the same
   * selection on a hard load or back/forward.
   * @param   {string} handle - Category or subcategory `pageUrl` marker
   * @returns {void}
   */
  const syncUrl = (handle: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/services/${handle}`);
    }
  };

  /**
   * Switch the main category, snap the subcategory to its first valid one and
   * reflect the category in the route
   * @param   {string} url - Category `pageUrl` marker
   * @returns {void}
   */
  const handleMain = (url: string) => {
    if (url === mainCat) {
      return;
    }
    setMainCat(url);
    const next = categories.find((c) => c.url === url);
    setSubCat(next?.subcategories[0]?.url ?? null);
    syncUrl(url);
  };

  /**
   * Switch the subcategory and reflect it in the route
   * @param   {string} url - Subcategory `pageUrl` marker
   * @returns {void}
   */
  const handleSub = (url: string) => {
    setSubCat(url);
    syncUrl(url);
  };

  /**
   * Keep the tabs in sync with the address bar on browser back/forward. The
   * History-API `pushState` above updates the URL without a Next navigation, so
   * a `popstate` would otherwise leave the URL and the selected tab out of step.
   * `/services` (no handle) resets to the first category, `/services/{handle}`
   * re-derives the category (and subcategory, when the handle is one).
   */
  useEffect(() => {
    /**
     * Re-derive the selected tabs from `window.location` on a history pop
     * @returns {void}
     */
    const onPopState = () => {
      const handle =
        window.location.pathname.replace(/^\/services\/?/, '') || null;
      if (!handle) {
        setMainCat(firstCategory?.url ?? null);
        setSubCat(firstCategory?.subcategories[0]?.url ?? null);
        return;
      }
      const asCategory = categories.find((c) => c.url === handle);
      if (asCategory) {
        setMainCat(asCategory.url);
        setSubCat(asCategory.subcategories[0]?.url ?? null);
        return;
      }
      const parent = categories.find((c) =>
        c.subcategories.some((s) => s.url === handle),
      );
      if (parent) {
        setMainCat(parent.url);
        setSubCat(handle);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [categories, firstCategory]);

  /** Subcategory url → lowercase display title, for the search predicate */
  const subTitleByUrl = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) =>
      category.subcategories.forEach((sub) =>
        map.set(sub.url, sub.title.toLowerCase()),
      ),
    );
    return map;
  }, [categories]);

  /**
   * A non-empty search query overrides the category/subcategory tabs and
   * matches services by name or subcategory title across the entire
   * catalogue, like the static-html mock (`name` OR `subcategory`).
   */
  const searching = query.trim().length > 0;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return services.filter((s) => {
        const subTitle = s.subcategoryUrl
          ? subTitleByUrl.get(s.subcategoryUrl)
          : undefined;
        return (
          s.title.toLowerCase().includes(q) || (subTitle?.includes(q) ?? false)
        );
      });
    }
    if (!mainCat) {
      return services;
    }
    return services.filter(
      (s) =>
        s.categoryUrl === mainCat &&
        (subCat === null || s.subcategoryUrl === subCat),
    );
  }, [services, mainCat, subCat, query, subTitleByUrl]);

  /** Switching the category/subcategory/search remounts the card grid */
  useScrollTriggerRefresh(filtered);

  return (
    <section
      data-testid="services-catalog"
      className="py-10"
      style={{ background: 'linear-gradient(180deg,#f7f7fb 0%,#fff 50%)' }}
    >
      <div className="page-shell">
        {/* Filter cluster — fade-only reveal: it holds the mobile salon dropdown
            (position: fixed), which a lingering wrapper transform would break */}
        <RevealAnimations fade>
          <SalonSelector salons={salons} selected={salon} onSelect={setSalon} />

          {/* Service search — under the salon filter; matches by service name */}
          <div className="relative mb-6">
            <Search
              size={18}
              color={MUTED}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
            <input
              data-testid="services-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                (dict?.search_by_service_placeholder?.value as
                  string | undefined) || 'Search by service…'
              }
              className="w-full rounded-xl bg-white px-11 py-3 text-base transition-colors outline-none"
              style={{
                border: '1.5px solid #e8e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                color: DARK,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = PINK;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e8e8f0';
              }}
            />
            {searching && (
              <button
                onClick={() => setQuery('')}
                aria-label={
                  (dict?.clear_search_text?.value as string | undefined) ||
                  'Clear search'
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {!searching && categories.length > 0 && (
            <CategoryTabs
              categories={categories}
              mainCat={mainCat}
              subCat={subCat}
              onMain={handleMain}
              onSub={handleSub}
            />
          )}

          {searching && (
            <p className="mb-2 text-sm text-neutral-300">
              {filtered.length}{' '}
              {filtered.length === 1
                ? (dict?.results_word_singular?.value as string | undefined) ||
                  'result'
                : (dict?.results_word_plural?.value as string | undefined) ||
                  'results'}{' '}
              {(dict?.for_word?.value as string | undefined) || 'for'} “
              {query.trim()}”
            </p>
          )}
        </RevealAnimations>

        {/* Service grid */}
        <div
          data-testid="services-grid"
          className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          {filtered.map((item, index) => (
            <GridItemAnimations key={item.id} index={index} className="h-full">
              <ServiceCard service={item} salonId={selectedSalonId} />
            </GridItemAnimations>
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            data-testid="services-empty"
            className="mt-6 text-center text-base text-neutral-300"
          >
            {searching
              ? (
                  (dict?.no_services_match_text?.value as string | undefined) ||
                  'No services match “%q%”.'
                ).replace('%q%', query.trim())
              : (dict?.no_services_section_text?.value as string | undefined) ||
                'No services in this section.'}
          </p>
        )}
      </div>
    </section>
  );
};

export default ServicesCatalog;
