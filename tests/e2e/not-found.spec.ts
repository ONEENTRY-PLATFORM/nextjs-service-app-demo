import { expect, test } from '@playwright/test';

// Unknown handles on the dynamic routes must land on the shared not-found UI
// (`app/not-found.tsx`) instead of an empty shell or a 5xx. smoke.spec only
// covers a bogus TOP-LEVEL path; each dynamic segment resolves its entity in
// its own way (`getPageByUrl` for pages, the admins list for specialists), so
// they are checked one by one.
const MISSING = [
  { name: 'service category', url: '/services/no-such-category-xyz' },
  { name: 'specialist', url: '/masters/999999' },
  { name: 'salon', url: '/salons/no-such-salon-xyz' },
  { name: 'gallery category', url: '/gallery/no-such-gallery-xyz' },
];

test.describe('Dynamic routes — unknown handle', () => {
  for (const { name, url } of MISSING) {
    test(`${name}: ${url} renders the not-found UI`, async ({ page }) => {
      const response = await page.goto(url);

      // A soft 404 (HTTP 200 + not-found UI) is acceptable; a server error is
      // not — that is the regression this guards against
      expect(response?.status() ?? 0).toBeLessThan(500);

      await expect(page.getByTestId('not-found')).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page
          .getByTestId('not-found')
          .getByRole('link', { name: /return home/i }),
      ).toBeVisible();
    });
  }
});
