import type { IPagesEntity } from 'oneentry/types';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getProducts } from '@/app/api/server/products/getProducts';
import { getSiteUrl } from '@/app/utils/getSiteUrl';

/**
 * ISR, one hour. A literal on purpose: segment config cannot be computed.
 *
 * Neither `force-static` nor `force-dynamic` is set. `force-static` without a
 * `revalidate` freezes the file until the next deploy — the service count and
 * the section list would stay as they were at build time — and `force-dynamic`
 * pays request latency for content that only changes when an admin edits it.
 */
export const revalidate = 3600;

/**
 * Project name for the `#` heading.
 *
 * Deliberately a constant rather than the CMS home-page title: that title is a
 * navigation label (`"Home"`), and the spec wants the name of the project in
 * `H1` — the first thing an assistant quotes.
 */
const SITE_NAME = 'Thalia Beauty Studio';

/** Blockquote fallback, used when the home page carries no description. */
const FALLBACK_SUMMARY =
  'A beauty studio in Dubai offering hair, face, body and nail services by appointment.';

/**
 * describe — one-line description of a CMS page for an `llms.txt` list item.
 *
 * `plainContent` rather than `htmlContent`: the file is plain markdown, and
 * tags leaking into it would be read as content by the assistant.
 * @param   {IPagesEntity} page - CMS page entity.
 * @returns {string}            Trimmed description, or `''` when the page has none.
 */
const describe = (page: IPagesEntity): string => {
  const text = page.localizeInfos?.plainContent?.trim() ?? '';
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
};

/**
 * listPages — renders CMS pages as `- [Title](absolute URL): description` lines.
 *
 * Absolute URLs are required by the spec: the file is read outside the context
 * of the domain, so a relative path is useless to the assistant.
 * @param   {IPagesEntity[]} pages   - CMS pages to render.
 * @param   {string}         baseUrl - Site origin.
 * @param   {string}         prefix  - Route prefix the pages live under, e.g. `services`.
 * @returns {string[]}               Markdown list lines.
 */
const listPages = (
  pages: IPagesEntity[],
  baseUrl: string,
  prefix: string,
): string[] =>
  pages
    .filter((page) => page.isVisible !== false && Boolean(page.pageUrl))
    .map((page) => {
      const title = page.localizeInfos?.title ?? page.pageUrl;
      const description = describe(page);
      const url = `${baseUrl}/${prefix}/${page.pageUrl}`;
      return `- [${title}](${url})${description ? `: ${description}` : ''}`;
    });

/**
 * GET — serves `/llms.txt`, the project map for AI assistants.
 *
 * Structure follows the llmstxt.org spec: exactly one `#` heading, exactly one
 * `>` blockquote right after it, then sections of links. Private routes
 * (`/profile`, `/auth`) are deliberately absent — they are disallowed in
 * `robots.txt`, and advertising them here would contradict that.
 * @returns {Promise<Response>} Plain-text response with the assembled file.
 * @see {@link https://llmstxt.org llms.txt specification}
 */
export async function GET(): Promise<Response> {
  const baseUrl = getSiteUrl();

  /** Independent reads — fetched together rather than in a waterfall. */
  const [home, serviceCategories, salons, catalog] = await Promise.all([
    getPageByUrl('home'),
    getChildPagesByParentUrl('services'),
    getChildPagesByParentUrl('salons'),
    /** Only `total` is needed: a probe, not an export of every service. */
    getProducts({ limit: 1, offset: 0 }),
  ]);

  const summary =
    home.page?.localizeInfos?.plainContent?.trim() || FALLBACK_SUMMARY;

  const lines: string[] = [`# ${SITE_NAME}`, '', `> ${summary}`, ''];

  const services = serviceCategories.pages ?? [];
  if (services.length > 0) {
    lines.push(
      '## Services',
      '',
      ...listPages(services, baseUrl, 'services'),
      '',
    );
  }

  const salonPages = salons.pages ?? [];
  if (salonPages.length > 0) {
    lines.push(
      '## Salons',
      '',
      ...listPages(salonPages, baseUrl, 'salons'),
      '',
    );
  }

  lines.push(
    '## Information',
    '',
    `- [Special offers](${baseUrl}/offers): current packages and discounts`,
    `- [Gallery](${baseUrl}/gallery): work of the studio's specialists`,
    `- [Specialists](${baseUrl}/masters): the team and what each master does`,
    `- [Reviews](${baseUrl}/reviews): client feedback`,
    `- [Contacts](${baseUrl}/contacts): addresses, phones and opening hours`,
    `- [Book online](${baseUrl}/booking): appointment booking`,
    `- [Sitemap](${baseUrl}/sitemap.xml): full list of pages`,
    '',
  );

  if (!catalog.isError && catalog.total > 0) {
    lines.push(`Services in the catalogue: ${catalog.total}`, '');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
