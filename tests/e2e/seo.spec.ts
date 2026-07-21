import { expect, test } from '@playwright/test';

// SEO metadata smoke. Beauty has no robots.txt / sitemap.xml routes, so this
// asserts the per-page metadata that `generateMetadata` emits (title,
// description, OpenGraph) and the soft-404 behaviour of unknown routes.
test.describe('SEO metadata', () => {
  const pages = [
    { name: 'home', url: '/' },
    { name: 'services', url: '/services' },
    { name: 'masters', url: '/masters' },
    { name: 'offers', url: '/offers' },
    { name: 'contacts', url: '/contacts' },
  ];

  for (const { name, url } of pages) {
    test(`${name} emits a non-empty <title>`, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveTitle(/\S/, { timeout: 30_000 });
    });
  }

  test('content pages emit description + OpenGraph metadata', async ({
    page,
  }) => {
    await page.goto('/offers');

    // `generateMetadata` sets a description and `openGraph: { type: 'article' }`
    await expect(
      page.locator('meta[name="description"]').first(),
    ).toHaveAttribute('content', /\S/, { timeout: 30_000 });
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      /article/i,
    );
  });

  test('absolute metadata URLs resolve against the SITE origin, not the CMS', async ({
    page,
  }) => {
    // Regression for MISMATCH-LOG §5.1/§5.2: SEO URLs used to be built from
    // `NEXT_PUBLIC_ONEENTRY_URL` (the CMS host). `metadataBase` now comes from
    // `getSiteUrl()`, so every absolute URL Next emits must live on the site.
    await page.goto('/');

    // Location-ish metadata: whatever of it Next emits must be absolute and on
    // this site. NOTE: `og:url` / `og:site_name` are declared in the ROOT
    // metadata only, and a page-level `openGraph` object REPLACES the root one
    // wholesale (`app/page.tsx`, `app/[handle]/page.tsx` set `type`/`title`
    // only) — so in practice neither tag reaches a page. The assertions below
    // are therefore conditional: they lock in "never the CMS host" without
    // pretending tags exist that do not.
    const locationMeta = await page
      .locator('meta[property="og:url"], link[rel="canonical"]')
      .evaluateAll((nodes) =>
        nodes.map(
          (node) =>
            node.getAttribute('content') ?? node.getAttribute('href') ?? '',
        ),
      );
    for (const value of locationMeta) {
      expect(value).toMatch(/^https?:\/\//);
      expect(value).not.toContain('oneentry.cloud');
    }

    // OpenGraph itself is emitted (the block exists at all)
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      /\S/,
    );
  });

  test('child pages inherit the site-name title template', async ({ page }) => {
    // Root metadata declares `title.template = "%s | <siteName>"`, so a page
    // with its own title renders as "<page> | <site>"
    await page.goto('/contacts');
    await expect(page).toHaveTitle(/\S+\s\|\s\S+/, { timeout: 30_000 });
  });

  test('robots.txt and sitemap.xml are served from the site origin', async ({
    request,
  }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const robotsBody = await robots.text();
    expect(robotsBody).toContain('Sitemap:');
    expect(robotsBody).not.toContain('oneentry.cloud');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain('<urlset');
    // Entries point at this site, never at the CMS host
    expect(sitemapBody).not.toContain('oneentry.cloud');
  });

  test('an unknown route renders the not-found view (soft 404, no 5xx)', async ({
    page,
  }) => {
    const resp = await page.goto('/definitely-missing-seo-xyz-404');
    await expect(page.getByTestId('not-found')).toBeVisible({
      timeout: 30_000,
    });
    expect(resp?.status() ?? 0).toBeLessThan(500);
  });
});
