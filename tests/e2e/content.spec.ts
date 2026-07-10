import { expect, test } from '@playwright/test';

test.describe('CMS content pages', () => {
  test('services page renders catalog categories from the Pages API', async ({
    page,
  }) => {
    await page.goto('/services');

    // Category cards are revealed by scroll-triggered GSAP animations,
    // so assert presence in the DOM rather than visibility
    await expect(page.locator('a[href^="/services/"]').first()).toBeAttached({
      timeout: 15_000,
    });
  });

  test('at least one service category page renders a products table', async ({
    page,
  }) => {
    // Visits up to 6 category pages; each is compiled on demand by `next dev`
    test.setTimeout(120_000);

    await page.goto('/services');

    // Category pages are SSG-generated from catalog_page children — collect
    // hrefs instead of hardcoding pageUrl markers, and navigate directly
    // since the links are hidden behind a GSAP scroll reveal. Not every
    // category is guaranteed to have plain products (some hold only
    // 'offer' offers), so scan until a products table is found
    await expect(page.locator('a[href^="/services/"]').first()).toBeAttached({
      timeout: 15_000,
    });
    const hrefs = await page
      .locator('a[href^="/services/"]')
      .evaluateAll((els) => [
        ...new Set(els.map((el) => el.getAttribute('href') || '')),
      ]);

    let tableFound = false;
    for (const href of hrefs.filter(Boolean).slice(0, 6)) {
      await page.goto(href);
      tableFound = await page
        .locator('table tr')
        .first()
        .waitFor({ state: 'attached', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (tableFound) break;
    }

    expect(tableFound).toBe(true);
  });

  test('gallery page renders images from the Pages API', async ({ page }) => {
    await page.goto('/gallery');

    await expect(page.locator('img').first()).toBeAttached({
      timeout: 15_000,
    });
  });

  test('masters page renders master cards with profile links', async ({
    page,
  }) => {
    await page.goto('/masters');

    await expect(page.locator('a[href^="/masters/"]').first()).toBeAttached({
      timeout: 15_000,
    });
  });

  test('contacts page loads with CMS content', async ({ page }) => {
    await page.goto('/contacts');

    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
