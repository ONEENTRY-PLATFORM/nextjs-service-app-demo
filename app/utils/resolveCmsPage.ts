import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';

/** Outcome of resolving a CMS page, with "missing" told apart from "broken". */
export type CmsPageResult =
  | { status: 'ok'; page: IPagesEntity }
  | { status: 'missing' }
  | { status: 'unavailable' };

/**
 * resolveCmsPage — decide whether a page is genuinely absent or the CMS is down.
 *
 * Routes used to collapse both into `if (!page || isError) return notFound()`,
 * which turns a transient outage into a hard 404 — and on a `force-static` route
 * that 404 is then frozen for the whole revalidate window. The two cases are
 * distinguishable and were verified against the live API: an unknown marker
 * answers `IError { statusCode: 404, message: 'Page not found' }`, which
 * `fetchCmsData` classifies as a STABLE result and returns; a 5xx / 429 / 408 /
 * timeout is transient and thrown instead, reaching the wrapper's catch with a
 * different (or absent) status.
 *
 * So only a real 404 means "missing". Everything else is "unavailable" and the
 * caller should degrade — render its fallbacks — rather than claim the page does
 * not exist.
 * @param   {string}                 pageUrl - Page marker (`pageUrl`) in the CMS
 * @returns {Promise<CmsPageResult>}         Which of the three cases happened
 */
export const resolveCmsPage = async (
  pageUrl: string,
): Promise<CmsPageResult> => {
  const { isError, error, page } = await getPageByUrl(pageUrl);

  if (!isError && page) {
    return { status: 'ok', page };
  }

  return error?.statusCode === 404
    ? { status: 'missing' }
    : { status: 'unavailable' };
};
