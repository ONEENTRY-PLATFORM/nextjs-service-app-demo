import { expect, test } from '@playwright/test';

// Locks in the hardening headers declared in `next.config.ts` and the ISR cache
// header that only a production server emits. Both are invisible in the UI, so
// nothing else in the suite would notice if a config edit dropped them — which
// is exactly why they need a test rather than a code review.
//
// The e2e webServer serves a production build on :3010, so these assertions run
// against the same output the deployment ships.

/** Every response passes through the `/:path*` rule, so one page proves them all. */
test('every hardening header is served', async ({ page }) => {
  const response = await page.goto('/');
  expect(response, 'homepage response').not.toBeNull();
  const headers = response!.headers();

  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['x-frame-options']).toBe('SAMEORIGIN');
  expect(headers['permissions-policy']).toContain('camera=()');
  expect(headers['strict-transport-security']).toContain('max-age=31536000');
});

test('the framework is not advertised', async ({ page }) => {
  const response = await page.goto('/');
  expect(response, 'homepage response').not.toBeNull();
  // `poweredByHeader: false` in next.config.ts.
  expect(response!.headers()['x-powered-by']).toBeUndefined();
});

test('static pages are served from the ISR cache, not re-rendered per request', async ({
  page,
}) => {
  // `/` is `force-static` with `revalidate`. The first hit may be a MISS on a
  // cold server; the second must be served from the cache. Asserting the header
  // exists at all is the point — its absence means the route quietly went
  // dynamic and every visitor now pays for a CMS round-trip.
  await page.goto('/');
  const second = await page.goto('/');
  expect(second, 'second homepage response').not.toBeNull();

  const cacheHeader = second!.headers()['x-nextjs-cache'];
  expect(cacheHeader, 'x-nextjs-cache must be present on a prerendered route').toBeDefined();
  expect(['HIT', 'STALE']).toContain(cacheHeader);
});
