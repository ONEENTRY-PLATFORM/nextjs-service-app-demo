import { expect, test } from '@playwright/test';

// The reviews page (`/reviews`) renders the `master_review` form storage, joined
// with each specialist's salon and service category. It renders regardless of the
// OneEntry `reviews` page entity and offers salon / category / specialist filters
// over a grid of review cards.
test.describe('Reviews page', () => {
  test('renders the heading and review cards', async ({ page }) => {
    await page.goto('/reviews');

    // `:visible` sidesteps a strict-mode violation during the Suspense reveal:
    // for a moment the old (hidden) subtree is still detaching while the new
    // one is already inserted, so the bare testid resolves to two nodes.
    const reviews = page.locator('[data-testid="reviews-page"]:visible');
    await expect(reviews).toBeVisible({ timeout: 30_000 });

    await expect(
      reviews.getByRole('heading', { name: 'Reviews', level: 1 }),
    ).toBeVisible();

    // The card grid is populated from the CMS reviews storage
    await expect(reviews.getByTestId('review-card').first()).toBeVisible();
    expect(await reviews.getByTestId('review-card').count()).toBeGreaterThan(0);
  });

  test('applying a filter narrows the cards without emptying the grid', async ({
    page,
  }) => {
    await page.goto('/reviews');

    // `:visible` — same Suspense-reveal double-node guard as the test above
    const reviews = page.locator('[data-testid="reviews-page"]:visible');
    const cards = reviews.getByTestId('review-card');
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    const total = await cards.count();

    // The salon / category / specialist filters are all buttons; any concrete
    // pick (i.e. not the "All" reset) can only keep or reduce the visible set,
    // and every filter option maps to at least one review, so the grid stays
    // non-empty. Scoped generically since the filters carry no test ids.
    const filterButton = reviews
      .getByRole('button')
      .filter({ hasNotText: /^all$/i })
      .first();
    test.skip(
      (await filterButton.count()) === 0,
      'no concrete filter buttons rendered',
    );

    await filterButton.click();
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeLessThanOrEqual(total);
  });
});
