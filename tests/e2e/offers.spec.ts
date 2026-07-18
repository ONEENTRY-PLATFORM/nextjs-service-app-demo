import { expect, test } from '@playwright/test';

// The offers page (`app/offers/page.tsx`) renders full-width offer detail cards
// from the CMS `offer` products, or a graceful "no offers" message when the CMS
// holds none — it never 404s.
test.describe('Special offers page', () => {
  test('renders the offers page with its heading', async ({ page }) => {
    await page.goto('/offers');

    await expect(page.getByTestId('offers-page')).toBeVisible({
      timeout: 30_000,
    });
    // The heading is static (not GSAP-revealed), so it is reliably visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('lists offer detail cards from the Products API', async ({ page }) => {
    await page.goto('/offers');

    const list = page.getByTestId('offers-list');
    await expect(list).toBeVisible({ timeout: 30_000 });

    // `offer` products exist in the CMS, so each detail card renders a
    // "Book Offer" button. The cards are revealed by a GSAP scroll animation,
    // so assert presence in the DOM (attached) rather than visibility.
    await expect(list.getByTestId('offer-book').first()).toBeAttached({
      timeout: 30_000,
    });
  });
});
