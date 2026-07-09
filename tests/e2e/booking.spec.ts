import { expect, test } from '@playwright/test';

// The booking page is the step wizard ported from the static-html mock
// (`BookingPage.tsx`): a hero, an entry screen with two flows and the
// "Your Appointment" summary in the right column (desktop).
test.describe('Booking wizard', () => {
  test('renders the hero and the entry screen', async ({ page }) => {
    await page.goto('/booking');

    await expect(
      page.getByRole('heading', { name: /book online/i }),
    ).toBeVisible();
    await expect(page.getByText('How would you like to start?')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Browse the studio')).toBeVisible();
    await expect(page.getByText('Choose a specialist').first()).toBeVisible();
  });

  test('studio-first flow walks to the studio step', async ({ page }) => {
    await page.goto('/booking');

    // Desktop entry card of the salon-first flow
    await page.getByText('Browse the studio').click();
    await expect(page.getByText('Choose your studio')).toBeVisible();

    // The summary sidebar reflects the started flow
    await expect(page.getByText('Your Appointment')).toBeVisible();
    await expect(page.getByText('Studio-first flow')).toBeVisible();

    // Picking a studio enables Continue → the service step opens
    const continueBtn = page.getByRole('button', { name: /continue/i }).first();
    await expect(continueBtn).toBeDisabled();
    await page.locator('#booking-section').getByText('Thalia').first().click();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();
    await expect(page.getByText('Choose a service')).toBeVisible();
  });

  test('back from the first step returns to the entry screen', async ({
    page,
  }) => {
    await page.goto('/booking');

    await page.getByText('Choose a specialist').first().click();
    await expect(page.getByText('Choose your specialist')).toBeVisible();

    await page.getByRole('button', { name: /change start/i }).click();
    await expect(page.getByText('How would you like to start?')).toBeVisible();
  });
});
