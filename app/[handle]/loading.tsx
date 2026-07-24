import type { JSX } from 'react';

/**
 * Loading skeleton for the catch-all `/[handle]` route (payment result pages).
 *
 * The route is `revalidate`-only with no `generateStaticParams`, so an unseen
 * handle is rendered on demand — this fills the gap while the server resolves
 * the dictionary and the CMS page. Mirrors the real container
 * (`min-h-80` + `max-w-(--breakpoint-2xl)`) and the page title, so swapping in
 * the content does not shift the layout.
 * @returns {JSX.Element} loading component.
 */
export default function Loading(): JSX.Element {
  return (
    <div className="mx-auto flex min-h-80 w-full max-w-(--breakpoint-2xl) flex-col overflow-hidden">
      <div className="flex flex-col pb-5 max-md:max-w-full">
        <div className="h-9 w-64 max-w-full animate-pulse rounded bg-slate-150" />
      </div>
    </div>
  );
}
