'use client';

import { Search, X } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

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
  /** Free-text service search */
  const [query, setQuery] = useState('');

  /**
   * Switch the main category and snap the subcategory to its first valid one
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
  };

  /**
   * A non-empty search query overrides the category/subcategory tabs and
   * matches services by name or description across the entire catalogue.
   */
  const searching = query.trim().length > 0;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return services.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    if (!mainCat) {
      return services;
    }
    return services.filter(
      (s) =>
        s.categoryUrl === mainCat &&
        (subCat === null || s.subcategoryUrl === subCat),
    );
  }, [services, mainCat, subCat, query]);

  return (
    <section
      data-testid="services-catalog"
      className="py-10"
      style={{ background: 'linear-gradient(180deg,#f7f7fb 0%,#fff 50%)' }}
    >
      <div className="mx-auto max-w-7xl px-3 md:px-8">
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
            placeholder="Search by service…"
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
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors"
              style={{ color: MUTED }}
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
            onSub={setSubCat}
          />
        )}

        {searching && (
          <p className="mb-2 text-sm" style={{ color: MUTED }}>
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'} for
            “{query.trim()}”
          </p>
        )}

        {/* Service grid */}
        <div
          data-testid="services-grid"
          className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          {filtered.map((item) => (
            <ServiceCard key={item.id} service={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            data-testid="services-empty"
            className="mt-6 text-center text-base"
            style={{ color: MUTED }}
          >
            {searching
              ? `No services match “${query.trim()}”.`
              : 'No services in this section.'}
          </p>
        )}
      </div>
    </section>
  );
};

export default ServicesCatalog;
