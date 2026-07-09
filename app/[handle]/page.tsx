import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import PaymentCanceled from '@/components/pages/PaymentCanceled';
import PaymentSuccess from '@/components/pages/PaymentSuccess';

/**
 * Dynamic page for displaying content based on URL
 * Used to display special pages such as payment success or payment cancellation
 * @async
 * @param   {object}                     props        - page parameters
 * @param   {Promise<{handle: string;}>} props.params - parameters with handle (URL part)
 * @returns {Promise<JSX.Element>}                    JSX page element
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export default async function PageLayout({
  params,
}: {
  params: Promise<{
    handle: string;
  }>;
}): Promise<JSX.Element> {
  /** Extract handle parameter from URL (e.g., 'payment_success' or 'payment_canceled') */
  const { handle } = await params;

  /** Fetch dictionary and CMS page in parallel — they're independent. */
  const [dictionary, pageResult] = await Promise.all([
    getDictionary(),
    getPageByUrl(handle),
  ]);
  const [dict] = ServerProvider('dict', dictionary);
  const { page, isError } = pageResult;

  /** If page not found or error occurred, show 404 page */
  if (isError || !page) {
    return notFound();
  }

  const { pageUrl, templateIdentifier } = page;

  /**
   * Array of page components with routing settings
   * Used to display specific pages such as payment success or payment cancellation
   */
  const pages = [
    {
      templateType: templateIdentifier,
      name: 'payment_success',
      component: <PaymentSuccess page={page} dict={dict} />,
    },
    {
      templateType: templateIdentifier,
      name: 'payment_canceled',
      component: <PaymentCanceled page={page} dict={dict} />,
    },
  ];

  /** Render component based on page URL */
  return (
    /** Container with width limitation and minimum height */
    <div className="mx-auto flex min-h-80 w-full max-w-(--breakpoint-2xl) flex-col overflow-hidden">
      {pages.map((p, i) => {
        /** Compare page URL with component names */
        if (pageUrl === p.name) {
          /** Return corresponding component */
          return <div key={i}>{p.component}</div>;
        }
        /** If no matches, return null */
        return null;
      })}
    </div>
  );
}

/**
 * Generate page metadata.
 * @param   {object}                     props        - page params.
 * @param   {Promise<{handle: string;}>} props.params - page params.
 * @returns {Promise<Metadata>}                       metadata.
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    handle: string;
  }>;
}): Promise<Metadata> {
  const { handle } = await params;

  /** Fetch page data based on the URL handle */
  const { page, isError } = await getPageByUrl(handle);
  /** Return default metadata or handle not found appropriately */
  if (isError || !page) {
    return {};
  }

  const { localizeInfos } = page;

  return {
    title: localizeInfos?.title || 'Default Title',
    description: localizeInfos?.plainValue || 'Default Description',
    openGraph: {
      type: 'article',
    },
  };
}
