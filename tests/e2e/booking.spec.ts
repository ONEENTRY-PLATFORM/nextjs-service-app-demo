import { expect, test } from '@playwright/test';

// The booking page is the step wizard: a hero, an entry screen with two flows and the
// "Your Appointment" summary in the right column (desktop).
test.describe('Booking wizard', () => {
  test('renders the hero and the entry screen', async ({ page }) => {
    await page.goto('/booking');

    await expect(
      page.getByRole('heading', { name: /book online/i }),
    ).toBeVisible();
    const entry = page.getByTestId('booking-entry');
    await expect(entry.getByTestId('booking-entry-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(entry.getByTestId('booking-flow-salon-first')).toBeVisible();
    await expect(
      entry.getByTestId('booking-flow-specialist-first'),
    ).toBeVisible();
  });

  test('studio-first flow walks to the studio step', async ({ page }) => {
    await page.goto('/booking');

    const wizard = page.getByTestId('booking-page');

    // Desktop entry card of the salon-first flow
    await page.getByTestId('booking-flow-salon-first').click();
    await expect(wizard.getByTestId('booking-step-salon')).toBeVisible({
      timeout: 30_000,
    });

    // The summary sidebar reflects the started flow (the flow label is
    // rendered from `md` up — this project runs at the desktop viewport)
    const summary = page.getByTestId('booking-summary');
    await expect(summary).toBeVisible();
    await expect(summary.getByTestId('booking-summary-flow')).toBeVisible();

    // Picking a studio enables Continue → the service step opens
    const continueBtn = page.getByTestId('booking-continue');
    await expect(continueBtn).toBeDisabled();
    // Any studio row will do — the salons come from the CMS
    const salon = wizard.getByTestId('booking-salon-option').first();
    await expect(salon).toBeVisible({ timeout: 30_000 });
    await salon.click();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();
    await expect(wizard.getByTestId('booking-step-service')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('back from the first step returns to the entry screen', async ({
    page,
  }) => {
    await page.goto('/booking');

    const wizard = page.getByTestId('booking-page');

    await page.getByTestId('booking-flow-specialist-first').click();
    await expect(wizard.getByTestId('booking-step-specialist')).toBeVisible({
      timeout: 30_000,
    });

    // On step 0 this button is labelled "Change start" and returns to the entry
    await wizard.getByTestId('booking-back').click();
    await expect(
      page.getByTestId('booking-entry').getByTestId('booking-entry-title'),
    ).toBeVisible();
  });
});
