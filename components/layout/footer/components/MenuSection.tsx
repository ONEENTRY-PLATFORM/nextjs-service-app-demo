import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import { getBlockByMarker } from '@/app/api/server/blocks/getBlockByMarker';
import { getMenuByMarker } from '@/app/api/server/menus/getMenuByMarker';
import { normalizeMenuPages } from '@/app/utils/normalizeMenuPages';
import type { OpeningHoursRow } from '@/app/utils/parseOpeningTime';
import parseOpeningTime from '@/app/utils/parseOpeningTime';
import summarizeOpeningHours from '@/app/utils/summarizeOpeningHours';
import { flatMenuToNested } from '@/components/utils';

import Copyrights from './Copyrights';
import FollowUs from './FollowUs';
import FooterCollapse from './FooterCollapse';
import type { FooterMenuItem } from './FooterServicesMenu';
import FooterServicesMenu from './FooterServicesMenu';
import OpeningTime from './OpeningTime';
import SalonsGrid from './SalonsGrid';

/**
 * Footer hours notation from the static-html mock: `10.00-22.00` instead of
 * the canonical `10:00 – 22:00` used elsewhere.
 * @param   {string} hours - Canonical hours of one weekday
 * @returns {string}       Hours in the footer's dotted notation
 */
const toFooterHours = (hours: string): string =>
  hours.replaceAll(':', '.').replaceAll(' – ', '-');

/**
 * Collapse the week the way the footer shows it (mock: a single
 * `Monday – Sunday` / `10.00-22.00` line). When the days do not share the same
 * hours the summary is impossible, so every weekday is listed instead.
 * @param   {OpeningHoursRow[]} rows - Weekday rows, Monday first
 * @returns {OpeningHoursRow[]}      One summary row, or the per-day rows
 */
const toFooterRows = (rows: OpeningHoursRow[]): OpeningHoursRow[] => {
  const summary = summarizeOpeningHours(rows);
  if (!summary) {
    return rows.map((row) => ({ ...row, hours: toFooterHours(row.hours) }));
  }

  const day =
    summary.from === summary.to
      ? summary.from
      : `${summary.from} – ${summary.to}`;
  return [{ day, hours: toFooterHours(summary.hours) }];
};

/**
 * Convert a CMS menu to plain footer menu items (nested one level).
 * @param   {IMenusEntity | undefined} menu    - Menu entity from the CMS
 * @param   {string}                   baseUrl - Base URL prefix for item links (e.g. `services`)
 * @returns {FooterMenuItem[]}                 Plain menu items for client components
 */
const toFooterItems = (
  menu: IMenusEntity | undefined,
  baseUrl: string,
): FooterMenuItem[] => {
  const pages = flatMenuToNested(normalizeMenuPages(menu?.pages), null);
  const href = (pageUrl: string | null) =>
    baseUrl ? `/${baseUrl}/${pageUrl ?? ''}` : `/${pageUrl ?? ''}`;

  return pages.map((page) => {
    const children = Array.isArray(page.children) ? page.children : [];
    return {
      title: (page.localizeInfos?.menuTitle as string | undefined) ?? '',
      href: href(page.pageUrl),
      ...(children.length > 0
        ? {
            children: children.map((child) => ({
              title:
                (child.localizeInfos?.menuTitle as string | undefined) ?? '',
              href: href(child.pageUrl),
            })),
          }
        : {}),
    };
  });
};

/**
 * MenuSection component to render the main content of the footer.
 *
 * Full port of the static-html footer: salons grid with the Opening Time
 * column (desktop), mobile collapses for salons / Opening Time / Services /
 * About us with dividers, the desktop Services–About–Follow row and the
 * copyright line.
 * @param   {object}               props      - Component properties
 * @param   {IAttributeValues}     props.dict - Dictionary object containing localized text values from OneEntry CMS
 * @returns {Promise<JSX.Element>}            JSX.Element representing the footer menu section with all its components
 */
const MenuSection = async ({
  dict,
}: {
  dict: IAttributeValues;
}): Promise<JSX.Element> => {
  const { opening_time_text, follow_us_text } = dict;

  /** All three fetches are independent — run in parallel. */
  const [servicesResult, aboutResult, openingResult] = await Promise.all([
    getMenuByMarker('services'),
    getMenuByMarker('about_us'),
    getBlockByMarker('opening_time'),
  ]);

  const servicesItems = toFooterItems(servicesResult.menu, 'services');
  const aboutItems = toFooterItems(aboutResult.menu, '');
  /** CMS schedule — an empty week simply hides the Opening Time column. */
  const openingRows = toFooterRows(
    parseOpeningTime(openingResult.block?.attributeValues?.opening_time?.value),
  );

  const servicesTitle = servicesResult.menu?.localizeInfos?.title ?? 'Services';
  const aboutTitle = aboutResult.menu?.localizeInfos?.title ?? 'About us';
  const openingTitle =
    (opening_time_text?.value as string | undefined) ?? 'Opening Time';
  const followTitle =
    (follow_us_text?.value as string | undefined) ?? 'Follow us';

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 text-black md:px-8 md:pt-12">
      {/* Salons + Opening Time (desktop 4th column) */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-0 xl:grid-cols-[1fr_1fr_1fr_9rem] sm:grid-cols-4 sm:gap-y-6">
        <SalonsGrid />

        {openingRows.length > 0 && (
          <div
            data-testid="footer-opening"
            className="hidden min-w-0 xl:block xl:border-l xl:border-black/80 xl:pl-4"
          >
            <p className="mb-3 text-sm font-bold tracking-wide uppercase">
              {openingTitle}
            </p>
            <OpeningTime rows={openingRows} />
          </div>
        )}
      </div>

      {/* Mobile/tablet divider between the salons and Opening Time */}
      <div className="h-px bg-black/80 xl:hidden sm:mt-5" />

      {/* Mobile/tablet: Opening Time — collapsible */}
      {openingRows.length > 0 && (
        <>
          <div data-testid="footer-opening-mobile" className="py-4 xl:hidden">
            <FooterCollapse title={openingTitle}>
              <div className="space-y-2">
                <OpeningTime rows={openingRows} variant="row" />
              </div>
            </FooterCollapse>
          </div>
          <div className="h-px bg-black/80 xl:hidden" />
        </>
      )}

      {/* Mobile/tablet: Services & About us collapses, Follow us at the bottom */}
      <div className="xl:hidden">
        {servicesItems.length > 0 && (
          <>
            <div className="py-4">
              <FooterCollapse title={servicesTitle}>
                <FooterServicesMenu items={servicesItems} />
              </FooterCollapse>
            </div>
            <div className="h-px bg-black/80" />
          </>
        )}
        {aboutItems.length > 0 && (
          <>
            <div className="py-4">
              <FooterCollapse title={aboutTitle}>
                <FooterServicesMenu items={aboutItems} />
              </FooterCollapse>
            </div>
            <div className="h-px bg-black/80" />
          </>
        )}
        <div className="pt-4">
          <FollowUs title={followTitle} />
        </div>
      </div>

      {/* Desktop divider under the salons */}
      <div className="mt-6 hidden h-px bg-black/80 xl:block" />

      {/* Desktop row: Services | About us | — | Follow us */}
      <div className="mt-8 hidden gap-x-4 xl:grid xl:grid-cols-[1fr_1fr_1fr_9rem]">
        <div className="min-w-0">
          <p className="mb-3 text-base font-bold">{servicesTitle}</p>
          <FooterServicesMenu items={servicesItems} dividers />
        </div>
        <div className="min-w-0 xl:pl-4">
          <p className="mb-3 text-base font-bold">{aboutTitle}</p>
          <FooterServicesMenu items={aboutItems} dividers />
        </div>
        <div className="xl:col-start-4 xl:pl-4">
          <FollowUs title={followTitle} />
        </div>
      </div>

      {/* Copyrights */}
      <div className="mt-10 text-sm">
        <Copyrights />
      </div>
    </div>
  );
};

export default MenuSection;
