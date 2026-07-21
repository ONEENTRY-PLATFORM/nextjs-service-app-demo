import { LANG_CODE } from '@/app/api/api/api';
import { getSiteName } from '@/app/utils/getSiteName';
import { getSiteUrl } from '@/app/utils/getSiteUrl';

/** The site-wide OpenGraph fields every page has to repeat for itself. */
export type PageOpenGraph = {
  url: string;
  siteName: string;
  locale: string;
};

/**
 * Site-wide OpenGraph fields for one page, to spread into its own `openGraph`.
 *
 * Next.js does NOT merge a page's `openGraph` with the root one — it replaces
 * the whole object. So `og:url`, `og:site_name` and `og:locale`, declared once
 * in `app/layout.tsx`, never reached any page that set its own `openGraph`
 * (found by `seo.spec.ts`). Spreading this helper first restores them, while
 * the page keeps overriding `type`/`title`/`description`:
 *
 * ```typescript
 * openGraph: { ...(await pageOpenGraph('/offers')), type: 'article' }
 * ```
 *
 * The URL is absolute on THIS site's origin (`getSiteUrl()`), never the CMS
 * host — `og:url` must be the canonical address of the page itself.
 * @param   {string}                 path - Route path of the page, leading slash included (`/offers`)
 * @returns {Promise<PageOpenGraph>}      OpenGraph fields shared by every page
 */
export const pageOpenGraph = async (path: string): Promise<PageOpenGraph> => ({
  url: `${getSiteUrl()}${path === '/' ? '' : path}`,
  siteName: await getSiteName(),
  locale: LANG_CODE,
});
