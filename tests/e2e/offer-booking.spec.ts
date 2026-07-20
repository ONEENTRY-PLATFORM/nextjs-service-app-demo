import { expect, test } from '@playwright/test';

// The offers page "Book Offer" button (OfferDetailCard.handleBook) adds the offer
// to the booking cart and routes to /booking — the offers → booking deep-link,
// previously untested. The handler no-ops until its RTK category query resolves,
// so the click is retried until the navigation actually fires.
//
// NOTE: this asserts the NAVIGATION only. Verified during authoring that the
// offer does NOT preselect its bundled services — the cart row carries the offer
// product id (set `offer`, ids 310–313), which is absent from the booking service
// catalog (`service` products), so the wizard's preselection no-ops and opens on
// the entry screen. Recorded as a latent gap in MISMATCH-LOG §7 #4; assert only
// the deep-link here rather than encoding that unwired behavior.
test.describe('Offer → booking deep-link', () => {
  // Desktop viewport keeps the booking summary column visible after landing
  test.use({ viewport: { width: 1440, height: 900 } });

  test('“Book Offer” navigates to the booking wizard', async ({ page }) => {
    await page.goto('/offers');

    const list = page.getByTestId('offers-list');
    await expect(list).toBeVisible({ timeout: 30_000 });
    const bookBtn = list.getByTestId('offer-book').first();
    await expect(bookBtn).toBeAttached({ timeout: 30_000 });
    await bookBtn.scrollIntoViewIfNeeded();

    // handleBook returns early until useGetPageByIdQuery has loaded the offer's
    // service category — retry the click until it actually navigates
    await expect(async () => {
      await bookBtn.click();
      await expect(page).toHaveURL(/\/booking\/?$/, { timeout: 8_000 });
    }).toPass({ timeout: 45_000 });

    await expect(page.getByTestId('booking-page')).toBeVisible({
      timeout: 30_000,
    });
  });
});
