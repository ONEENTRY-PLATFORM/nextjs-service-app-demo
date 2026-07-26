import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import { resolveCmsPage } from '@/app/utils/resolveCmsPage';
import PaymentCanceled from '@/components/pages/PaymentCanceled';
import PaymentSuccess from '@/components/pages/PaymentSuccess';

/**
 * ISR: refresh the prerendered CMS content on a timer. Not `force-static` —
 * this route reads request-time data (searchParams) or has no static params.
 */
export const revalidate = 60;

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
  const [dictionary, resolved] = await Promise.all([
    getDictionary(),
    resolveCmsPage(handle),
  ]);
  const [dict] = ServerProvider('dict', dictionary);

  /**
   * Only a genuine 404 from the CMS means the page does not exist. A CMS
   * outage used to take the same branch and bake a 404 into the ISR cache for
   * the whole revalidate window — right as the user came back from Stripe.
   */
  if (resolved.status === 'missing') {
    return notFound();
  }

  /**
   * Unlike the catalog routes there is nothing to degrade to: the page IS the
   * content, and even the template dispatch below keys off `page.pageUrl`.
   * Throwing reaches the error boundary (retry) on a cache miss, and a failed
   * background regeneration keeps serving the last valid version.
   */
  if (resolved.status === 'unavailable') {
    throw new Error(
      `/${handle}: CMS is unavailable — rendering the error boundary instead of baking a 404 into ISR`,
    );
  }

  const { page } = resolved;

  /**
   * Markers this catch-all route knows how to render. Every other page marker
   * either has its own route in `app/` or is not meant to be reachable here.
   */
  const templates: Record<string, JSX.Element | undefined> = {
    payment_success: <PaymentSuccess page={page} dict={dict} />,
    payment_canceled: <PaymentCanceled page={page} dict={dict} />,
  };

  const content = templates[page.pageUrl];

  /**
   * The page exists in the CMS but this route has no template for it (e.g.
   * `home`, whose canonical route is `/`). Rendering the empty container would
   * answer 200 with a blank page, so treat it as not found instead.
   */
  if (!content) {
    return notFound();
  }

  return (
    /** Container with width limitation and minimum height */
    <div className="mx-auto flex min-h-80 w-full max-w-(--breakpoint-2xl) flex-col overflow-hidden">
      {content}
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
  return cmsPageMetadata({
    pageUrl: handle,
    path: `/${handle}`,
    fallbackTitle: 'Default Title',
    fallbackDescription: 'Default Description',
  });
}
