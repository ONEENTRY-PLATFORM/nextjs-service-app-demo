import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

// "Компоненты обязаны деградировать без ошибок" (CLAUDE.md) and the
// `withTimeout` invariant of MISMATCH-LOG §5.12: when the CMS is unreachable a
// page must still render its shell — an empty section or a fallback — instead
// of crashing into the error boundary.
//
// Scope note: the e2e build is a production build, so the server-rendered parts
// are prerendered and never re-fetched from the browser. What Playwright can
// break is the CLIENT-side traffic to the CMS, which is exactly what this
// covers: catalog pages read by the home sections, the `contact_us` form and
// the payment accounts of the booking wizard.
const CMS_API_RE = /beauty\.oneentry\.cloud\/api\//;

/**
 * Make every browser-side CMS API call fail for this page.
 *
 * Two failure shapes are used in turn — a dead connection (`route.abort`) and a
 * server error (`500`) — because the SDK handles them along different paths.
 * @param   {Page}          page - Playwright page
 * @param   {string}        mode - `abort` (connection lost) or `error` (HTTP 500)
 * @returns {Promise<void>}      Resolves once the route is installed
 */
const breakCms = async (page: Page, mode: 'abort' | 'error'): Promise<void> => {
  await page.route(CMS_API_RE, async (route) => {
    if (mode === 'abort') {
      await route.abort('failed');
      return;
    }
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 500, message: 'E2E outage' }),
    });
  });
};

/**
 * Assert a page rendered its own shell and no failure UI.
 * @param   {Page}          page   - Playwright page
 * @param   {string}        testId - Page container testid
 * @returns {Promise<void>}        Resolves once the shell is verified
 */
const expectShell = async (page: Page, testId: string): Promise<void> => {
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('error-boundary')).toHaveCount(0);
  await expect(page.getByTestId('not-found')).toHaveCount(0);
};

test.describe('CMS outage — graceful degradation', () => {
  test('home keeps rendering when its client-side CMS reads die', async ({
    page,
  }) => {
    await breakCms(page, 'abort');
    await page.goto('/');

    // Header, hero and the prerendered sections are unaffected; the client
    // reads (gallery/catalog pages) simply resolve to nothing
    await expect(page.getByTestId('main-nav')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('error-boundary')).toHaveCount(0);
    await expect(page.getByTestId('home-catalog')).toBeAttached();
  });

  test('contacts renders without the CMS-driven contact form', async ({
    page,
  }) => {
    await breakCms(page, 'error');
    await page.goto('/contacts');

    await expectShell(page, 'contacts-page');
    // The salon cards are prerendered — the page keeps its substance
    await expect(page.getByTestId('salon-card').first()).toBeVisible();
  });

  test('the booking wizard opens without the payment accounts', async ({
    page,
  }) => {
    await breakCms(page, 'abort');
    await page.goto('/booking');

    await expectShell(page, 'booking-page');
  });

  test('the header search survives a failing search request', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/');
    // Break the CMS only AFTER the page is up, so the search request is the
    // first thing that fails
    await breakCms(page, 'error');

    await page.getByTestId('header-search-open').click();
    await page.getByTestId('header-search-input').fill('hair');

    // No results, no crash: the popup shows its empty state and stays usable
    await expect(page.getByTestId('search-empty')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('error-boundary')).toHaveCount(0);
    await page.getByRole('button', { name: 'Close search' }).click();
    await expect(page.getByTestId('header-search-input')).toHaveCount(0);
  });
});
