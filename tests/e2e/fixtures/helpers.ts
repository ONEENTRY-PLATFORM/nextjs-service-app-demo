import { expect, type Page } from '@playwright/test';

import { credentials } from '../../credentials';

/**
 * Whether the E2E user credentials are configured (E2E_USER_EMAIL / _PASSWORD).
 * Callers `test.skip(!hasCreds(), …)` so the auth-gated specs degrade gracefully.
 * @returns {boolean} True when both email and password are set.
 */
export const hasCreds = (): boolean =>
  Boolean(credentials.email && credentials.password);

/**
 * Sign the test user in through the /profile auth wall (drawer `SignInForm`).
 * Leaves the browser on /profile with the authenticated account view rendered;
 * the session persists in localStorage, so a later full navigation keeps it.
 * @param   {Page}           page - Playwright page
 * @returns {Promise<void>}       Resolves once the profile view is visible
 */
export const signInTestUser = async (page: Page): Promise<void> => {
  await page.goto('/profile');
  await page.getByTestId('auth-required').getByRole('button').first().click();
  const form = page.getByTestId('auth-form-sign-in');
  await form.getByTestId('form-field-email_reg').fill(credentials.email);
  await form.getByTestId('form-field-password_reg').fill(credentials.password);
  await form.getByTestId('form-submit').click();
  // Login → getMe → auth context → profile re-render. Under a cold dev server
  // with parallel workers this can run long, so allow a generous budget.
  await expect(page.getByTestId('profile-page')).toBeVisible({
    timeout: 45_000,
  });
};

/**
 * Walk the studio-first booking wizard from the entry screen all the way to a
 * picked date & time slot, leaving the confirm/payment step ready in the summary.
 *
 * The date is chosen in the NEXT month (every day is future, so no slot is greyed
 * out as past) on the 15th — a day that exists in every month.
 * @param   {Page}           page - Playwright page (already on /booking)
 * @returns {Promise<void>}       Resolves once a slot is selected
 */
export const walkBookingToDateTime = async (page: Page): Promise<void> => {
  const wizard = page.getByTestId('booking-page');
  const continueBtn = page.getByTestId('booking-continue');

  // Studio → service → specialist
  await page.getByTestId('booking-flow-salon-first').click();
  await wizard.getByTestId('booking-salon-option').first().click();
  await continueBtn.click();

  const serviceStep = wizard.getByTestId('booking-step-service');
  await expect(serviceStep).toBeVisible({ timeout: 30_000 });
  await serviceStep.getByTestId('booking-service-option').first().click();
  await continueBtn.click();

  await expect(wizard.getByTestId('booking-step-specialist')).toBeVisible({
    timeout: 30_000,
  });
  // Prefer the "Any specialist" card; fall back to a concrete master. Both render
  // a mobile + desktop node — pick the visible (desktop) one.
  const anySpecialist = page
    .locator('[data-testid="booking-any-specialist"]:visible')
    .first();
  const masterOption = page
    .locator('[data-testid="booking-master-option"]:visible')
    .first();
  if (await anySpecialist.count()) {
    await anySpecialist.click();
  } else {
    await masterOption.click();
  }
  await continueBtn.click();

  // Date & time — next month (all future), the 15th, first available slot
  await expect(wizard.getByTestId('booking-step-datetime')).toBeVisible({
    timeout: 30_000,
  });
  await wizard.getByTestId('booking-cal-next').click();
  await wizard
    .locator('[data-testid="booking-day"][data-day="15"][data-past="false"]')
    .click();
  await wizard
    .locator('[data-testid="booking-slot"]:not([disabled])')
    .first()
    .click();
};
