'use client';

import type { JSX } from 'react';
import { useEffect } from 'react';

import { useDict } from '@/app/store/providers/useDict';

/**
 * Error — route-segment error boundary for the page subtree.
 *
 * Next.js renders this in place of the page when a Server or Client Component
 * below the root layout throws during render. A CMS/SDK failure that escapes a
 * wrapper (or any unexpected throw) therefore degrades to a recoverable notice
 * inside the normal header/footer chrome instead of a blank screen or a crashed
 * request. `reset()` re-renders the segment — re-running the failed data fetch —
 * without a full page reload.
 * @param   {object}                      props       - Error boundary props injected by Next.js.
 * @param   {Error & { digest?: string }} props.error - The thrown error (`digest` is set in production).
 * @param   {() => void}                  props.reset - Re-renders the segment to retry.
 * @returns {JSX.Element}                             Fallback UI for the page subtree.
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/error-handling Next.js docs}
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  const dict = useDict();

  useEffect(() => {
    // Surface the error for observability. In production Next strips the
    // message from `error`, keeping only `digest`, so log the whole object.
    // eslint-disable-next-line no-console -- an error boundary is meant to log
    console.error(error);
  }, [error]);

  return (
    <div
      data-testid="error-boundary"
      className="flex grow flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h1 className="text-2xl font-bold">
        {(dict?.something_went_wrong_title?.value as string | undefined) ||
          'Something went wrong'}
      </h1>
      <p className="max-w-md text-base text-neutral-600">
        {(dict?.error_load_page_desc?.value as string | undefined) ||
          "We couldn't load this page. Please try again in a moment."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-gradient-brand px-6 py-2.5 font-medium text-white"
      >
        {(dict?.try_again_text?.value as string | undefined) || 'Try again'}
      </button>
    </div>
  );
}
