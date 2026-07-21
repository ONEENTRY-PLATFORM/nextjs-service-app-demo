import { expect, test } from '@playwright/test';

// The CMS `opening_time` block (a `timeInterval` attribute) feeds two places:
// the contacts "Opening Hours" section (`OpeningHours` → `OpeningHoursDayCard`)
// and the footer column (`MenuSection` → `OpeningTime`). Both render through
// `parseOpeningTime`, and an empty parse simply hides them — so the specs skip
// rather than fail when the block is not filled in.

/** Canonical hours notation of the contacts section, e.g. "10:00 – 22:00". */
const CANONICAL_HOURS = /\d{1,2}:\d{2}\s*–\s*\d{1,2}:\d{2}/;
/** Footer notation of the same schedule, e.g. "10.00-22.00". */
const FOOTER_HOURS = /\d{1,2}\.\d{2}-\d{1,2}\.\d{2}/;

test.describe('Opening hours from the CMS', () => {
  test('the contacts section renders a full week of hours', async ({
    page,
  }) => {
    // Desktop: the per-day grid is the `lg` layout; the compact summary card
    // below `lg` is covered by the mobile project
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/contacts');
    await expect(page.getByTestId('contacts-page')).toBeVisible({
      timeout: 30_000,
    });

    const section = page.getByTestId('opening-hours');
    test.skip(!(await section.count()), '`opening_time` is empty in the CMS');

    await expect(section).toBeAttached();
    // Seven weekday cards (the desktop grid); the hidden mobile branch adds its
    // own copies only when the days differ, so filter to the visible ones
    const days = section.locator(
      '[data-testid="opening-hours-day"]:visible, [data-testid="opening-hours-summary"]:visible',
    );
    await expect(days.first()).toBeVisible();
    await expect(days.first()).toContainText(CANONICAL_HOURS);

    // Exactly one day may be marked as "Today"
    await expect(section.getByText('Today', { exact: true })).toHaveCount(1);
  });

  test('the footer column repeats the schedule in its own notation', async ({
    page,
  }) => {
    // The footer column is `xl:block` — it needs the widest layout
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/contacts');

    const footer = page.getByTestId('footer');
    await expect(footer).toBeAttached({ timeout: 30_000 });

    const column = footer.getByTestId('footer-opening');
    test.skip(!(await column.count()), '`opening_time` is empty in the CMS');

    await column.scrollIntoViewIfNeeded();
    await expect(column).toBeVisible();
    // Mock notation: "Monday – Sunday" / "10.00-22.00" while the week is uniform
    await expect(column).toContainText(FOOTER_HOURS);
  });
});
