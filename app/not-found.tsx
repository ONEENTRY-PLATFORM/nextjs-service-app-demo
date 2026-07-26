import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { getPagePlainContent } from '@/app/utils/getPagePlainContent';
import { dictText } from '@/components/utils/dictText';

/** Shown when the CMS page has no text — the page must never be bare */
const FALLBACK_DESCRIPTION =
  'The page you are looking for does not exist or has been moved.';

/**
 * 404 page layout
 * @returns {Promise<JSX.Element>} page layout JSX.Element
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/not-found Next.js docs}
 */
const NotFound = async (): Promise<JSX.Element> => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  /** get page by url from the API. */
  const { page, isError } = await getPageByUrl('404');

  /** if no page data return fallback */
  if (isError || !page) {
    return (
      <div
        data-testid="not-found"
        className="mx-auto flex size-full max-w-(--breakpoint-xl) flex-col items-center justify-center py-8"
      >
        <h1 className="mb-10 text-6xl">404</h1>
        <p className="mb-4">
          {dictText(dict, 'not_found_desc', FALLBACK_DESCRIPTION)}
        </p>
        <Link
          href="/"
          className="items-center justify-center rounded-card border border-solid border-fuchsia-500 bg-transparent px-3.5 py-1 text-base font-bold tracking-wide text-fuchsia-500 uppercase transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:bg-neutral-300/50 disabled:text-neutral-300"
        >
          {dictText(dict, 'return_home_text', 'Return home')}
        </Link>
      </div>
    );
  }

  /** extract data from page */
  const { localizeInfos } = page;

  return (
    <div
      data-testid="not-found"
      className="mx-auto flex min-h-96 w-full max-w-(--breakpoint-xl) flex-col items-center justify-center py-8 text-neutral-700"
    >
      <h1 className="mb-10 text-6xl">{localizeInfos?.title || '404'}</h1>
      <p className="mb-4">
        {/*
         * The text comes from the page's own content field, not from an
         * `error_description` attribute: the page carries no attribute set, and
         * every other route already reads its body text this way.
         */}
        {getPagePlainContent(page) ||
          dictText(dict, 'not_found_desc', FALLBACK_DESCRIPTION)}
      </p>
      <Link
        href="/"
        className="items-center justify-center rounded-card border border-solid border-fuchsia-500 bg-transparent px-3.5 py-1 text-base font-bold tracking-wide text-fuchsia-500 uppercase transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:bg-neutral-300/50 disabled:text-neutral-300"
      >
        {dictText(dict, 'return_home_text', 'Return home')}
      </Link>
    </div>
  );
};

export default NotFound;
