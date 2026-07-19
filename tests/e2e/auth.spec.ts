import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { credentials } from '../credentials';

// Auth goes through the drawer sign-in form (`SignInForm`). The CMS `email`
// provider (email + password, no activation code) is enabled, and the fields
// come from the OneEntry `reg` form (email_reg / password_reg). The signed-in
// test only runs when E2E_USER_EMAIL / E2E_USER_PASSWORD are provided.
test.describe('Authentication', () => {
  /**
   * Open the sign-in drawer from the /profile auth wall.
   * @param   {Page}             page - Playwright page
   * @returns {Promise<Locator>}      The sign-in form, with its fields ready
   */
  const openSignIn = async (page: Page): Promise<Locator> => {
    await page.goto('/profile');
    // The auth wall carries a single "Sign in" button that opens the drawer
    await page.getByTestId('auth-required').getByRole('button').first().click();
    const form = page.getByTestId('auth-form-sign-in');
    await expect(form.getByTestId('form-field-email_reg')).toBeVisible({
      timeout: 30_000,
    });
    return form;
  };

  test('rejects invalid credentials with an inline error', async ({ page }) => {
    const form = await openSignIn(page);

    await form
      .getByTestId('form-field-email_reg')
      .fill('no-such-user-9421@example.com');
    await form
      .getByTestId('form-field-password_reg')
      .fill('definitely-wrong-pw');
    await form.getByTestId('form-submit').click();

    // The live auth endpoint rejects the credentials → the shared error primitive
    await expect(form.getByTestId('form-error')).toBeVisible({
      timeout: 30_000,
    });
    // Still signed out — the account view never renders
    await expect(page.getByTestId('profile-page')).toHaveCount(0);
  });

  test('signs in with valid credentials and reveals the profile', async ({
    page,
  }) => {
    test.skip(
      !credentials.email || !credentials.password,
      'E2E_USER_EMAIL / E2E_USER_PASSWORD not set',
    );

    const form = await openSignIn(page);

    await form.getByTestId('form-field-email_reg').fill(credentials.email);
    await form
      .getByTestId('form-field-password_reg')
      .fill(credentials.password);
    await form.getByTestId('form-submit').click();

    // Login updates the auth context → the account view replaces the 401 wall
    await expect(page.getByTestId('profile-page')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('auth-required')).toHaveCount(0);
  });
});

// Sign-up shares the drawer: the "Create account" button in the sign-in form
// swaps it for `SignUpForm`, whose fields come from the same `reg` form.
test.describe('Sign-up', () => {
  /**
   * Open the sign-up drawer (sign-in wall → "Create account").
   * @param   {Page}             page - Playwright page
   * @returns {Promise<Locator>}      The sign-up form, fields ready
   */
  const openSignUp = async (page: Page): Promise<Locator> => {
    await page.goto('/profile');
    await page.getByTestId('auth-required').getByRole('button').first().click();
    await page.getByTestId('auth-create-account').click();
    const form = page.getByTestId('auth-form-sign-up');
    await expect(form.getByTestId('form-field-email_reg')).toBeVisible({
      timeout: 30_000,
    });
    return form;
  };

  test('renders the registration fields', async ({ page }) => {
    const form = await openSignUp(page);

    await expect(form.getByTestId('form-field-name_reg')).toBeVisible();
    await expect(form.getByTestId('form-field-password_reg')).toBeVisible();
    await expect(form.getByTestId('form-field-repeat_password')).toBeVisible();
  });

  test('rejects an already-registered email', async ({ page }) => {
    test.skip(
      !credentials.email || !credentials.password,
      'need an existing account email (E2E_USER_*)',
    );
    const form = await openSignUp(page);

    // Registering the existing test account again is rejected by the CMS — this
    // exercises the submit path without creating a new user
    await form.getByTestId('form-field-email_reg').fill(credentials.email);
    await form.getByTestId('form-field-name_reg').fill('E2E Duplicate');
    await form.getByTestId('form-field-phone_reg').fill('+971500000000');
    await form
      .getByTestId('form-field-password_reg')
      .fill(credentials.password);
    await form
      .getByTestId('form-field-repeat_password')
      .fill(credentials.password);
    await form.getByTestId('form-submit').click();

    await expect(form.getByTestId('form-error')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('profile-page')).toHaveCount(0);
  });

  test('registers a brand-new account and signs in', async ({ page }) => {
    // Off by default: this writes a real user to the CMS (no delete endpoint).
    // Enable deliberately with E2E_ALLOW_SIGNUP=1.
    test.skip(
      process.env.E2E_ALLOW_SIGNUP !== '1',
      'set E2E_ALLOW_SIGNUP=1 to create a throwaway CMS user',
    );
    const form = await openSignUp(page);
    const email = `e2e+${Date.now()}@example.com`;

    await form.getByTestId('form-field-email_reg').fill(email);
    await form.getByTestId('form-field-name_reg').fill('E2E Signup');
    await form.getByTestId('form-field-phone_reg').fill('+971500000000');
    await form.getByTestId('form-field-password_reg').fill('Test1234!');
    await form.getByTestId('form-field-repeat_password').fill('Test1234!');
    await form.getByTestId('form-submit').click();

    // Provider `email` has isCheckCode=false → the account is active at once and
    // the form signs the user in, so the profile view renders
    await expect(page.getByTestId('profile-page')).toBeVisible({
      timeout: 30_000,
    });
  });
});

// Password reset (`ForgotPasswordForm` → generateCode → `VerificationForm`).
// The OTP is delivered out-of-band (email), so the flow can only be verified up
// to the code-entry step — completing it needs the real code.
test.describe('Password reset', () => {
  test('sending the email opens the verification step', async ({ page }) => {
    test.skip(!credentials.email, 'need an account email (E2E_USER_EMAIL)');

    await page.goto('/profile');
    await page.getByTestId('auth-required').getByRole('button').first().click();
    await page.getByTestId('auth-reset-password').click();

    const form = page.getByTestId('auth-form-forgot-password');
    await expect(form.getByTestId('form-field-email_reg')).toBeVisible({
      timeout: 30_000,
    });
    await form.getByTestId('form-field-email_reg').fill(credentials.email);
    await form.getByTestId('form-submit').click();

    // generateCode succeeds (or 400 "code already active") → the OTP form opens
    await expect(page.getByTestId('auth-form-verification')).toBeVisible({
      timeout: 30_000,
    });
  });
});
