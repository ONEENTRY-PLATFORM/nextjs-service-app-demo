import { expect, test } from '@playwright/test';

// The booking wizard offers two entry flows; booking-flow.spec walks the
// studio-first one. This covers the OTHER flow — specialist-first — where the
// specialist step comes FIRST and the studio/service/time follow. The summary's
// flow caption and the picked-specialist card are the observable proof. Desktop
// viewport (≥ xl = 1240px) keeps the summary column visible throughout.
test.describe('Booking wizard — specialist-first flow', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('starts on the specialist step and the summary carries the pick', async ({
    page,
  }) => {
    await page.goto('/booking');
    const wizard = page.getByTestId('booking-page');
    const summary = page.getByTestId('booking-summary');
    const continueBtn = page.getByTestId('booking-continue');

    // Enter the specialist-first flow from the entry screen
    await expect(page.getByTestId('booking-entry')).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId('booking-flow-specialist-first').click();

    // Unlike studio-first (which opens on the salon step), this flow opens on
    // the specialist step — the ordering that distinguishes the two flows
    await expect(wizard.getByTestId('booking-step-specialist')).toBeVisible({
      timeout: 30_000,
    });
    await expect(wizard.getByTestId('booking-step-salon')).toHaveCount(0);
    // The summary caption names the active flow
    await expect(summary.getByTestId('booking-summary-flow')).toHaveText(
      'Choose-a-specialist flow',
    );

    // Nothing picked yet → Continue is gated and no specialist is in the summary
    await expect(continueBtn).toBeDisabled();
    await expect(summary.getByTestId('booking-summary-master')).toHaveCount(0);

    // Pick a concrete specialist (the visible desktop card) and remember the
    // name so we can prove the SAME pick lands in the summary
    const card = page
      .locator('[data-testid="booking-master-option"]:visible')
      .first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    const name = (await card.locator('p').first().innerText()).trim();
    expect(name.length).toBeGreaterThan(0);
    await card.click();

    // The picked specialist appears in the summary and Continue unlocks
    const summaryMaster = summary.getByTestId('booking-summary-master');
    await expect(summaryMaster).toBeVisible();
    await expect(summaryMaster).toContainText(name);
    await expect(continueBtn).toBeEnabled();

    // Advance → the specialist step is left behind for the next one (salon when
    // the specialist works at several studios, otherwise service), and the
    // summary keeps the specialist as the flow accumulates
    await continueBtn.click();
    await expect(
      page
        .locator(
          '[data-testid="booking-step-salon"], [data-testid="booking-step-service"]',
        )
        .first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(summaryMaster).toContainText(name);
  });
});
