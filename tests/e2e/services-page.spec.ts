import { expect, test } from '@playwright/test';

// The services catalog (`ServicesCatalog`) is the interactive core of the
// services page: a search box over the whole catalogue and category tabs that
// filter the grid client-side. Cards are revealed by a GSAP scroll animation,
// so their presence is asserted with `toBeAttached`.
test.describe('Services catalog', () => {
  test('search filters the grid and the empty state / clear both work', async ({
    page,
  }) => {
    await page.goto('/services');

    const grid = page.getByTestId('services-grid');
    await expect(grid.getByTestId('service-card').first()).toBeAttached({
      timeout: 30_000,
    });

    // A query that matches no service name/description → the empty state,
    // and the grid is emptied
    const input = page.getByTestId('services-search-input');
    await input.fill('zzz-not-a-real-service-qqq');
    await expect(page.getByTestId('services-empty')).toBeVisible();
    await expect(grid.getByTestId('service-card')).toHaveCount(0);

    // Clearing the query restores the catalogue
    await input.fill('');
    await expect(page.getByTestId('services-empty')).toHaveCount(0);
    await expect(grid.getByTestId('service-card').first()).toBeAttached({
      timeout: 15_000,
    });
  });

  test('switching the main category re-filters the grid', async ({ page }) => {
    await page.goto('/services');

    const grid = page.getByTestId('services-grid');
    await expect(grid.getByTestId('service-card').first()).toBeAttached({
      timeout: 30_000,
    });

    const tabs = page.getByTestId('services-category-tab');
    test.skip((await tabs.count()) < 2, 'needs at least two categories');

    // Exactly one tab is active, and the catalogue starts on it
    const activeTab = page.locator(
      '[data-testid="services-category-tab"][data-active="true"]',
    );
    await expect(activeTab).toHaveCount(1);
    const firstIdBefore = await grid
      .getByTestId('service-card')
      .first()
      .getAttribute('data-service-id');

    // Switch to a different category
    const inactive = page
      .locator('[data-testid="services-category-tab"][data-active="false"]')
      .first();
    const targetUrl = await inactive.getAttribute('data-cat-url');
    await inactive.click();

    // Selection moved to the clicked tab (still single-select)
    await expect(activeTab).toHaveCount(1);
    await expect(activeTab).toHaveAttribute(
      'data-cat-url',
      targetUrl as string,
    );

    // The grid actually re-filtered: a different first card, or the empty state
    // for a category that holds only offers
    await expect(async () => {
      const count = await grid.getByTestId('service-card').count();
      if (count === 0) {
        await expect(page.getByTestId('services-empty')).toBeVisible();
        return;
      }
      const firstIdAfter = await grid
        .getByTestId('service-card')
        .first()
        .getAttribute('data-service-id');
      expect(firstIdAfter).not.toBe(firstIdBefore);
    }).toPass({ timeout: 15_000 });
  });
});
