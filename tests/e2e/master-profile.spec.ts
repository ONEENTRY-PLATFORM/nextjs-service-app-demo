import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

// Depth of the specialist profile (`master-single` + `portfolio-grid`):
// the portfolio lightbox, the salon chips, the review modal and the booking
// button. masters.spec only covers the grid → profile click-through.
//
// Every one of these sections is CMS-driven and optional (the layout degrades
// when a master has no portfolio / salon), so each test skips rather than fails
// when its data is missing.

/**
 * Open the first specialist profile reachable from the masters grid.
 * @param   {Page}          page - Playwright page
 * @returns {Promise<void>}      Resolves once the profile is rendered
 */
const openFirstMaster = async (page: Page): Promise<void> => {
  await page.goto('/masters');
  const card = page
    .getByTestId('masters-page')
    .getByTestId('master-card')
    .first();
  await expect(card).toBeAttached({ timeout: 30_000 });
  const href = await card.getAttribute('href');
  // Navigate directly: the tile sits behind a GSAP scroll reveal, so clicking
  // it can race the animation (same reasoning as masters.spec)
  await page.goto(href as string);
  await expect(page.getByTestId('master-page')).toBeVisible({
    timeout: 30_000,
  });
};

test.describe('Master profile — details', () => {
  // Desktop: the masters grid renders the MasterCard tiles, and the profile
  // shows the two-column card
  test.use({ viewport: { width: 1280, height: 900 } });

  test('portfolio photo opens the lightbox with counter and keyboard paging', async ({
    page,
  }) => {
    await openFirstMaster(page);

    const grid = page.getByTestId('portfolio-grid');
    const hasPortfolio = await grid.count();
    test.skip(!hasPortfolio, 'this specialist has no portfolio in the CMS');

    const items = grid.getByTestId('portfolio-item');
    const total = await items.count();
    await items.first().scrollIntoViewIfNeeded();
    await items.first().click();

    const lightbox = page.getByTestId('portfolio-lightbox');
    await expect(lightbox).toBeVisible({ timeout: 15_000 });
    await expect(lightbox).toContainText(`1 / ${total}`);
    // Caption carries the "name · role" line and the Share action
    await expect(lightbox.getByRole('button', { name: 'Share' })).toBeVisible();

    if (total > 1) {
      await page.keyboard.press('ArrowRight');
      await expect(lightbox).toContainText(`2 / ${total}`);
      // Paging wraps backwards past the first photo
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await expect(lightbox).toContainText(`${total} / ${total}`);
    }

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('portfolio-lightbox')).toHaveCount(0);
  });

  test('a salon chip links to that salon page', async ({ page }) => {
    await openFirstMaster(page);

    // Chips are only links when their salon page resolved (`href` is optional)
    const chip = page.locator('a[data-testid="master-salon-chip"]').first();
    test.skip(
      !(await chip.count()),
      'this specialist has no linked salon in the CMS',
    );

    const href = await chip.getAttribute('href');
    expect(href).toMatch(/^\/salons\/[^/]+$/);

    await chip.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`), { timeout: 30_000 });
    await expect(page.getByTestId('salon-page')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('"Leave a review" opens the review modal and Escape closes it', async ({
    page,
  }) => {
    await openFirstMaster(page);

    await page.getByTestId('master-leave-review').click();
    const review = page.getByTestId('review-modal');
    await expect(review).toBeVisible();

    // Confirm unlocks only once a rating AND text are given (client-only flow)
    const confirm = review.getByRole('button', { name: 'Confirm' });
    await expect(confirm).toBeDisabled();
    await review.getByRole('button', { name: 'Rate 4 star(s)' }).click();
    await expect(confirm).toBeDisabled();
    await review.getByRole('textbox').fill('Lovely work, thank you!');
    await expect(confirm).toBeEnabled();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('review-modal')).toHaveCount(0);
  });

  test('the booking button opens the wizard from the profile', async ({
    page,
  }) => {
    await openFirstMaster(page);

    await page.getByTestId('master-book').click();
    await expect(page).toHaveURL(/\/booking$/, { timeout: 30_000 });
    await expect(page.getByTestId('booking-page')).toBeVisible({
      timeout: 30_000,
    });
  });
});
