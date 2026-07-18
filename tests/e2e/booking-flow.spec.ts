import { expect, test } from '@playwright/test';

// Deeper coverage of the booking wizard than booking.spec: this walks the
// studio-first flow across three steps and asserts the "Your Appointment"
// summary accumulates each pick. The desktop viewport (≥ xl = 1240px) keeps the
// summary column visible throughout. Confirming an order needs an authenticated
// session, so the flow stops before the "Book" button.
test.describe('Booking wizard — studio-first flow', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('walks studio → service → specialist and the summary accumulates the picks', async ({
    page,
  }) => {
    await page.goto('/booking');
    const wizard = page.getByTestId('booking-page');
    const summary = page.getByTestId('booking-summary');
    const continueBtn = page.getByTestId('booking-continue');

    // Start the studio-first flow
    await page.getByTestId('booking-flow-salon-first').click();
    await expect(wizard.getByTestId('booking-step-salon')).toBeVisible({
      timeout: 30_000,
    });

    // Pick a studio → Continue is gated on a selection → the service step opens
    await expect(continueBtn).toBeDisabled();
    await wizard.getByTestId('booking-salon-option').first().click();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Service step — the summary now carries the Studio row (exact match keeps
    // the "Studio-first flow" caption from satisfying it)
    const serviceStep = wizard.getByTestId('booking-step-service');
    await expect(serviceStep).toBeVisible({ timeout: 30_000 });
    await expect(summary.getByText('Studio', { exact: true })).toBeVisible();

    // Pick a service → Continue → specialist step
    await expect(continueBtn).toBeDisabled();
    await serviceStep.getByTestId('booking-service-option').first().click();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Specialist step — the summary carries BOTH the Studio and Service rows
    await expect(wizard.getByTestId('booking-step-specialist')).toBeVisible({
      timeout: 30_000,
    });
    await expect(summary.getByText('Studio', { exact: true })).toBeVisible();
    await expect(summary.getByText('Service', { exact: true })).toBeVisible();
  });

  test('the chosen service can be changed away on the specialist step', async ({
    page,
  }) => {
    await page.goto('/booking');
    const wizard = page.getByTestId('booking-page');
    const continueBtn = page.getByTestId('booking-continue');

    // Fast-walk to the specialist step with a service chosen
    await page.getByTestId('booking-flow-salon-first').click();
    await wizard.getByTestId('booking-salon-option').first().click();
    await continueBtn.click();
    const serviceStep = wizard.getByTestId('booking-step-service');
    await expect(serviceStep).toBeVisible({ timeout: 30_000 });
    await serviceStep.getByTestId('booking-service-option').first().click();
    await continueBtn.click();

    const specialistStep = wizard.getByTestId('booking-step-specialist');
    await expect(specialistStep).toBeVisible({ timeout: 30_000 });

    // The sticky service chip carries a "Change" button that clears the service
    const change = specialistStep.getByRole('button', { name: /^change$/i });
    await expect(change).toBeVisible();
    await change.click();

    // Service cleared → the summary no longer shows the Service row
    await expect(
      page.getByTestId('booking-summary').getByText('Service', { exact: true }),
    ).toHaveCount(0);
  });
});
