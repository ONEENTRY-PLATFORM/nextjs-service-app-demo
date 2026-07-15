import { expect, test } from '@playwright/test';

test.describe('CMS content pages', () => {
  test('services page renders catalog categories from the Pages API', async ({
    page,
  }) => {
    await page.goto('/services');

    // Service cards are revealed by scroll-triggered GSAP animations,
    // so assert presence in the DOM rather than visibility. The catalog
    // renders the services of the pre-selected category — the tabs
    // themselves are buttons, so the cards are the observable proof that
    // the catalog was built from the Pages API
    const catalog = page.getByTestId('services-catalog');
    await expect(catalog).toBeAttached({ timeout: 30_000 });
    await expect(catalog.getByTestId('service-card').first()).toBeAttached({
      timeout: 30_000,
    });
  });

  test('at least one service category page renders a products table', async ({
    page,
  }) => {
    // Visits up to 6 category pages; each is compiled on demand by `next dev`
    test.setTimeout(120_000);

    // Category pages are SSG-generated from catalog_page children — collect
    // hrefs from the home catalog tiles (page content built from the Pages
    // API, unlike the header/footer chrome links) instead of hardcoding
    // pageUrl markers, and navigate directly since the tiles are hidden
    // behind a GSAP scroll reveal. Not every category is guaranteed to have
    // plain products (some hold only 'offer' offers), so scan until a
    // category renders its products
    await page.goto('/');
    const tiles = page.getByTestId('home-catalog').getByTestId('catalog-card');
    await expect(tiles.first()).toBeAttached({ timeout: 30_000 });
    const hrefs = await tiles.evaluateAll((els) => [
      ...new Set(els.map((el) => el.getAttribute('href') || '')),
    ]);

    let productsFound = false;
    for (const href of hrefs
      .filter((h) => h.startsWith('/services/'))
      .slice(0, 6)) {
      await page.goto(href);
      productsFound = await page
        .getByTestId('services-catalog')
        .getByTestId('service-card')
        .first()
        .waitFor({ state: 'attached', timeout: 15_000 })
        .then(() => true)
        .catch(() => false);
      if (productsFound) break;
    }

    expect(productsFound).toBe(true);
  });

  test('gallery page renders images from the Pages API', async ({ page }) => {
    await page.goto('/gallery');

    await expect(
      page
        .getByTestId('gallery-page')
        .getByTestId('gallery-grid')
        .getByTestId('gallery-item')
        .first(),
    ).toBeAttached({ timeout: 30_000 });
  });

  test('masters page renders master cards with profile links', async ({
    page,
  }) => {
    await page.goto('/masters');

    // Any card will do — they are equivalent; scoped to the page root so the
    // header/footer `/masters/*` chrome links can never satisfy the assertion
    const card = page
      .getByTestId('masters-page')
      .getByTestId('master-card')
      .first();
    await expect(card).toBeAttached({ timeout: 30_000 });
    await expect(card).toHaveAttribute('href', /^\/masters\//);
  });

  test('contacts page loads with CMS content', async ({ page }) => {
    await page.goto('/contacts');

    await expect(
      page.getByTestId('contacts-page').getByTestId('contacts-hero-title'),
    ).toBeVisible({ timeout: 30_000 });
  });
});
