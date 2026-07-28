import { expect, test } from '@playwright/test';

// The offers page "Book Offer" button (OfferDetailCard.handleBook) opens the
// offer booking modal (components/layout/offer-booking, mock
// `OfferBookingModal.tsx`): a salon dropdown with the first salon preselected,
// the specialists able to perform the package, the day chips with the time
// grid, then the summary step whose confirm is auth-gated ("Sign in to book"
// for a signed-out client). No navigation happens — the old
// `/booking?services=…` deep link remains only as the fallback for a CMS
// without specialists.
test.describe('Offer → booking modal', () => {
  // Desktop viewport keeps the whole modal on screen
  test.use({ viewport: { width: 1440, height: 900 } });

  test('“Book Offer” opens the modal and walks to the summary step', async ({
    page,
  }) => {
    await page.goto('/offers');

    const list = page.getByTestId('offers-list');
    await expect(list).toBeVisible({ timeout: 30_000 });
    const bookBtn = list.getByTestId('offer-book').first();
    await expect(bookBtn).toBeAttached({ timeout: 30_000 });
    await bookBtn.scrollIntoViewIfNeeded();
    await bookBtn.click();

    const modal = page.getByTestId('offer-booking-modal');
    await expect(modal).toBeVisible({ timeout: 30_000 });

    // Step 1 — the first salon is preselected in the dropdown
    await expect(modal.getByTestId('offer-salon-select')).toBeVisible();

    // Pick the first available specialist
    const master = modal.getByTestId('offer-master-option').first();
    await expect(master).toBeVisible({ timeout: 30_000 });
    await master.click();

    // Tomorrow sidesteps today's already-passed slots, then the first free time
    await modal.getByTestId('offer-day-chip').nth(1).click();
    const slot = modal
      .locator('[data-testid="offer-time-slot"]:not([disabled])')
      .first();
    await expect(slot).toBeVisible({ timeout: 30_000 });
    await slot.click();

    // Continue unlocks once salon + specialist + slot are picked
    const cont = modal.getByTestId('offer-booking-continue');
    await expect(cont).toBeEnabled();
    await cont.click();

    // Step 2 — summary with the auth-gated confirm (signed-out run)
    await expect(modal.getByTestId('offer-booking-summary')).toBeVisible();
    await expect(modal.getByTestId('offer-booking-confirm')).toHaveText(
      /sign in to book/i,
    );

    // The modal replaced the deep-link navigation — the URL must not change
    await expect(page).toHaveURL(/\/offers$/);
  });

  // The /booking?services= deep link stays live production code — it is the
  // declared fallback of both Book Offer buttons whenever the CMS gives the
  // modal nothing to work with (no salons / specialists / resolvable bundle).
  // Driven directly so the check does not depend on degrading the CMS; the
  // ids are the "Sands of Serenity" bundle (Relax Massage 277, Moroccan
  // Bath 282 — offer_services of product 313).
  test('deep link /booking?services= preselects the bundle (fallback path)', async ({
    page,
  }) => {
    await page.goto('/booking?services=282,277');

    await expect(page.getByTestId('booking-page')).toBeVisible({
      timeout: 30_000,
    });

    // The preselection puts the wizard into the studio-first flow with the
    // services already in the "Your Appointment" summary
    const summary = page.getByTestId('booking-summary');
    await expect(summary).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('booking-summary-flow')).toHaveText(
      /Studio-first flow/i,
      { timeout: 30_000 },
    );
    await expect(
      summary.getByText('Service', { exact: true }).first(),
    ).toBeVisible({ timeout: 30_000 });
  });
});
