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
