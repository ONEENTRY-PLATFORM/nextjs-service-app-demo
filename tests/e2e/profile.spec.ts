import { expect, test } from '@playwright/test';

// The profile route is auth-gated: without a session it renders the 401
// "authorization required" screen (`AuthError`) with a sign-in action, rather
// than the account UI. (Auth providers are disabled in the CMS, so the signed-in
// view is out of scope here.)
test.describe('Profile (unauthenticated)', () => {
  test('shows the authorization-required screen with a sign-in action', async ({
    page,
  }) => {
    await page.goto('/profile');

    const authRequired = page.getByTestId('auth-required');
    await expect(authRequired).toBeVisible({ timeout: 30_000 });
    await expect(authRequired).toContainText('401');

    // The signed-out profile must NOT render the account UI
    await expect(page.getByTestId('profile-page')).toHaveCount(0);

    // A sign-in affordance is offered (button or link)
    const signIn = authRequired
      .getByRole('button')
      .or(authRequired.getByRole('link'));
    await expect(signIn.first()).toBeVisible();
  });
});
