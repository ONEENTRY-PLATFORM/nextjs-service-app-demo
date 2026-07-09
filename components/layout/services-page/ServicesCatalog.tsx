'use client';

import { ChevronDown, MapPin, Search, X } from 'lucide-react';
import type { JSX } from 'react';
import { Fragment, useMemo, useState } from 'react';

import ServiceCard from './ServiceCard';
import type { ServiceItem, ServicesCategory, ServicesSalon } from './types';

/** Brand colors from the static-html mock (`PricesPage.tsx`) */
const PINK = '#ed21f1';
const PINK2 = '#f60efb';
const DARK = '#4c4d56';
const MUTED = '#a8a9b5';

/**
 * ServicesCatalog component — the interactive part of the services page as in
 * the static-html mock (`PricesPage.tsx`): salon selector (cards on desktop,
 * dropdown on mobile), free-text service search, main category chips,
 * subcategory tabs and the responsive grid of service cards.
 *
 * All data comes pre-fetched from the server as plain arrays; every section
 * degrades gracefully while the CMS is not filled yet — an empty salons list
 * hides the selector, no categories means the chips row is not rendered and
 * the grid shows everything the CMS has.
 * @param   {object}             props            - Component properties
 * @param   {ServicesCategory[]} props.categories - Service categories with their subcategories
 * @param   {ServicesSalon[]}    props.salons     - Salon locations for the selector
 * @param   {ServiceItem[]}      props.services   - Flat list of all services
 * @returns {JSX.Element}                         Interactive services catalog section
 */
const ServicesCatalog = ({
  categories,
  salons,
  services,
}: {
  categories: ServicesCategory[];
  salons: ServicesSalon[];
  services: ServiceItem[];
}): JSX.Element => {
  const firstCategory = categories[0];
  const [mainCat, setMainCat] = useState<string | null>(
    firstCategory?.url ?? null,
  );
  const [subCat, setSubCat] = useState<string | null>(
    firstCategory?.subcategories[0]?.url ?? null,
  );
  /** Selected salon `pageUrl`; `null` = All studios */
  const [salon, setSalon] = useState<string | null>(salons[0]?.url ?? null);
  /** Mobile salon dropdown open state */
  const [salonOpen, setSalonOpen] = useState(false);
  /** Free-text service search */
  const [query, setQuery] = useState('');

  /** Currently selected category entity (for its subcategories list) */
  const activeCategory = categories.find((c) => c.url === mainCat);
  const subCats = activeCategory?.subcategories ?? [];

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

  /** Selected salon entity for the mobile dropdown label */
  const activeSalon = salons.find((s) => s.url === salon);

  return (
    <section
      className="py-10"
      style={{ background: 'linear-gradient(180deg,#f7f7fb 0%,#fff 50%)' }}
    >
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        {/* Salon selector — DESKTOP: cards */}
        {salons.length > 0 && (
          <div className="mb-8 hidden gap-3 md:grid md:grid-cols-3">
            {salons.map((s, index) => {
              const active = s.url === salon;
              return (
                <button
                  key={s.url}
                  onClick={() => setSalon(active ? null : s.url)}
                  className="rounded-xl px-4 py-3 text-left transition-all active:scale-[0.97]"
                  style={{
                    background: active
                      ? `linear-gradient(135deg,${PINK2},${PINK})`
                      : '#fff',
                    color: active ? '#fff' : DARK,
                    boxShadow: active
                      ? `0 8px 24px ${PINK}33`
                      : '0 2px 10px rgba(0,0,0,0.05)',
                    border: active ? 'none' : '1.5px solid #e8e8f0',
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <MapPin size={14} />
                    <span className="text-base font-bold">
                      Studio {index + 1} — {s.title}
                    </span>
                  </div>
                  {s.address && (
                    <p className="text-sm opacity-80">{s.address}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Salon selector — MOBILE: compact dropdown */}
        {salons.length > 0 && (
          <div className="relative mb-6 md:hidden">
            <button
              onClick={() => setSalonOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3"
              style={{
                border: '1.5px solid #e8e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <span
                className="flex items-center gap-2 text-base font-semibold"
                style={{ color: DARK }}
              >
                <MapPin size={14} color={PINK} />
                {activeSalon
                  ? `Studio ${salons.indexOf(activeSalon) + 1} — ${activeSalon.title}`
                  : 'All studios'}
              </span>
              <ChevronDown
                size={16}
                color={MUTED}
                style={{
                  transform: salonOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform .2s',
                }}
              />
            </button>
            {salonOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSalonOpen(false)}
                />
                <div
                  className="absolute inset-x-0 z-20 mt-1 overflow-hidden rounded-xl bg-white"
                  style={{
                    border: '1.5px solid #e8e8f0',
                    boxShadow: '0 12px 32px rgba(180,40,220,0.18)',
                  }}
                >
                  <button
                    onClick={() => {
                      setSalon(null);
                      setSalonOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-base font-semibold"
                    style={{
                      color: !salon ? PINK : DARK,
                      background: !salon ? `${PINK}0d` : 'transparent',
                    }}
                  >
                    All studios
                  </button>
                  {salons.map((s, index) => {
                    const active = s.url === salon;
                    return (
                      <button
                        key={s.url}
                        onClick={() => {
                          setSalon(s.url);
                          setSalonOpen(false);
                        }}
                        className="w-full border-t px-4 py-3 text-left"
                        style={{
                          borderColor: '#f1f1f5',
                          background: active ? `${PINK}0d` : 'transparent',
                        }}
                      >
                        <span
                          className="block text-base font-semibold"
                          style={{ color: active ? PINK : DARK }}
                        >
                          Salon {index + 1} — {s.title}
                        </span>
                        {s.address && (
                          <span
                            className="block text-sm"
                            style={{ color: MUTED }}
                          >
                            {s.address}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Service search — under the salon filter; matches by service name */}
        <div className="relative mb-6">
          <Search
            size={18}
            color={MUTED}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          />
          <input
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
                    onClick={() => handleMain(c.url)}
                    className="flex min-w-28 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.96] md:min-w-0 md:px-5"
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
                        onClick={() => setSubCat(sub.url)}
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
                        onClick={() => setSubCat(sub.url)}
                        className="relative px-1 pb-1 text-base font-medium transition-opacity"
                        style={{
                          color: PINK,
                          opacity: active ? 1 : 0.65,
                        }}
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
        )}

        {searching && (
          <p className="mb-2 text-sm" style={{ color: MUTED }}>
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'} for
            “{query.trim()}”
          </p>
        )}

        {/* Service grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((item) => (
            <ServiceCard key={item.id} service={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-6 text-center text-base" style={{ color: MUTED }}>
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
