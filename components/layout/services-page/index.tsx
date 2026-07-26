import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { dictText } from '@/components/utils/dictText';
import { fileDisplayUrl } from '@/components/utils/fileDisplayUrl';

import PromoBanner from './PromoBanner';
import ServicesCatalog from './ServicesCatalog';
import ServicesHero from './ServicesHero';
import type { ServiceItem, ServicesCategory, ServicesSalon } from './types';

/**
 * ServicesPageContent — the body shared by `/services` and `/services/{handle}`.
 *
 * The two routes rendered the same hero / catalog / promo tree and re-derived
 * the same subtitle and stats line from the catalog, comment for comment; the
 * deep-link route only adds the preselected tab. They were the last area
 * (with offers) that had no `index.tsx`, so the composition lived in the route
 * files and had to be kept in sync by hand.
 *
 * What stays in the routes is what genuinely differs: the CMS reads, the
 * `notFound()` decision (the root `/services` deliberately never 404s) and the
 * JSON-LD.
 * @param   {object}             props                      - Component properties
 * @param   {IPagesEntity}       [props.page]               - CMS `services` page; absent when the CMS is unavailable
 * @param   {ServicesCategory[]} props.categories           - Categories with their subcategories
 * @param   {ServicesSalon[]}    props.salons               - Salon locations for the selector
 * @param   {ServiceItem[]}      props.services             - Flat list of all services
 * @param   {string}             [props.initialCategory]    - `pageUrl` of the category to pre-select
 * @param   {string}             [props.initialSubcategory] - `pageUrl` of the subcategory to pre-select
 * @param   {string}             [props.resetKey]           - Remounts the catalog when the deep-linked category changes
 * @returns {JSX.Element}                                   Services page body
 */
const ServicesPageContent = ({
  page,
  categories,
  salons,
  services,
  initialCategory,
  initialSubcategory,
  resetKey,
}: {
  page?: IPagesEntity | undefined;
  categories: ServicesCategory[];
  salons: ServicesSalon[];
  services: ServiceItem[];
  initialCategory?: string | undefined;
  initialSubcategory?: string | undefined;
  resetKey?: string | undefined;
}): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /**
   * A missing or errored page only drops the custom heading — the hero, catalog
   * (with its own empty state) and promo banner still render.
   */
  const title =
    page?.localizeInfos?.title ??
    dictText(dict, 'services_title', 'Services & Prices');
  /** Hero kicker and background live in the page's `page_simple` attributes. */
  const kicker = page?.attributeValues?.page_tag?.value as string | undefined;
  const heroBg = fileDisplayUrl(page?.attributeValues?.page_hero_bg?.value);
  /** Stats line under the hero title — only when the CMS has services */
  const subtitle =
    services.length > 0
      ? `${services.length} services · ${salons.length || 3} locations across Dubai`
      : undefined;
  /** Counter pairs for the hero strip — only when the CMS has services */
  const stats: Array<[string | number, string]> | undefined =
    services.length > 0
      ? [
          [
            services.length,
            dictText(dict, 'services_stat_services', 'Services'),
          ],
          [
            salons.length,
            dictText(dict, 'services_stat_locations', 'Locations'),
          ],
          [
            categories.length,
            dictText(dict, 'services_stat_categories', 'Categories'),
          ],
        ]
      : undefined;

  return (
    <>
      <ServicesHero
        title={title}
        kicker={kicker}
        subtitle={subtitle}
        stats={stats}
        bg={heroBg || undefined}
      />
      {/*
       * The key must sit HERE, on the catalog: without it a move between two
       * category deep-links reuses the mounted catalog and keeps the previously
       * selected tab instead of snapping to the new one.
       */}
      <ServicesCatalog
        key={resetKey}
        categories={categories}
        salons={salons}
        services={services}
        {...(initialCategory ? { initialCategory } : {})}
        {...(initialSubcategory ? { initialSubcategory } : {})}
      />
      <PromoBanner />
    </>
  );
};

export default ServicesPageContent;
