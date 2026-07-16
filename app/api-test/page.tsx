import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import ApiTestClient from './ApiTestClient';

// Force-dynamic: this is a dev-only benchmark dashboard, not CMS content — it
// must re-run its measurements on every load rather than be served from a
// prerender. (The rule against force-dynamic targets CMS pages; in production
// this route is notFound() anyway, see below.)
export const dynamic = 'force-dynamic';

/**
 * ApiTestPage — dev performance dashboard for the OneEntry API.
 *
 * Gates the route on `NODE_ENV`: in production the page triggers `notFound()`
 * so the dashboard never ships to end users; in dev/preview the client benchmark
 * is rendered.
 * @returns {JSX.Element} JSX of the dashboard.
 */
export default function ApiTestPage(): JSX.Element {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <ApiTestClient />;
}
