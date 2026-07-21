import { expect, test } from '@playwright/test';

// The offers page "Book Offer" button (OfferDetailCard.handleBook) opens the
// booking wizard with the offer's bundled services preselected: the offer
// product itself (set `offer`, ids 310–313) is absent from the booking service
// catalog, so the link carries the product ids from `offer_services`
// (`/booking?services=...`) and the wizard preselects them (useServicesPrefill
// → useBookingPreselect).
test.describe('Offer → booking deep-link', () => {
  // Desktop viewport keeps the booking summary column visible after landing
  test.use({ viewport: { width: 1440, height: 900 } });

  test('“Book Offer” preselects the bundled services in the wizard', async ({
    page,
  }) => {
    await page.goto('/offers');

    const list = page.getByTestId('offers-list');
    await expect(list).toBeVisible({ timeout: 30_000 });
    const bookBtn = list.getByTestId('offer-book').first();
    await expect(bookBtn).toBeAttached({ timeout: 30_000 });
    await bookBtn.scrollIntoViewIfNeeded();

    await bookBtn.click();
    await expect(page).toHaveURL(/\/booking\?services=[\d,]+$/, {
      timeout: 30_000,
    });
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
