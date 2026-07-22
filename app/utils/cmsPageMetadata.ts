import type { Metadata } from 'next';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { pageOpenGraph } from '@/app/utils/pageOpenGraph';

/**
 * cmsPageMetadata — the `generateMetadata` body every CMS-backed route repeats:
 * read the page by its marker, take the title and the page text for the
 * description, pin the canonical URL and restore the site-wide OpenGraph fields
 * that a page-level `openGraph` would otherwise drop (see
 * {@link pageOpenGraph}).
 *
 * A page the CMS cannot serve degrades instead of throwing: metadata falls back
 * to `fallbackTitle` / `fallbackDescription` when given, otherwise to an empty
 * object so Next uses the root layout's title template.
 * @param   {object}            input                       - Input
 * @param   {string}            input.pageUrl               - `pageUrl` marker of the page in the CMS
 * @param   {string}            input.path                  - Route path, leading slash included (`/offers`)
 * @param   {string}            [input.fallbackTitle]       - Title when the CMS has none (or is unreachable)
 * @param   {string}            [input.fallbackDescription] - Description when the page carries no text
 * @param   {string}            [input.titlePrefix]         - Entity name put in front of the page title (`"Anna - Specialists"`)
 * @param   {string}            [input.ogType]              - OpenGraph `type`; `'article'` unless the route is something else
 * @returns {Promise<Metadata>}                             Next.js metadata for the route
 */
export const cmsPageMetadata = async ({
  pageUrl,
  path,
  fallbackTitle,
  fallbackDescription,
  titlePrefix,
  ogType = 'article',
}: {
  pageUrl: string;
  path: string;
  fallbackTitle?: string | undefined;
  fallbackDescription?: string | undefined;
  titlePrefix?: string | undefined;
  ogType?: 'article' | 'website' | 'profile' | undefined;
}): Promise<Metadata> => {
  const { page, isError } = await getPageByUrl(pageUrl);

  if (isError || !page) {
    return {
      ...(fallbackTitle ? { title: fallbackTitle } : {}),
      ...(fallbackDescription ? { description: fallbackDescription } : {}),
    };
  }

  const pageTitle = page.localizeInfos?.title || fallbackTitle;
  const title = titlePrefix ? `${titlePrefix} - ${pageTitle}` : pageTitle;

  return {
    title,
    /**
     * The description falls back to the PAGE title, not the prefixed one: an
     * entity page ("Anna - Specialists") should still describe itself with the
     * section title when the CMS carries no text for it.
     */
    description: getPagePlainContent(page) || fallbackDescription || pageTitle,
    alternates: { canonical: path },
    openGraph: {
      ...(await pageOpenGraph(path)),
      type: ogType,
    },
  };
};
