import { expect, test } from '@playwright/test';

import { hasCreds, signInTestUser } from './fixtures/helpers';

// Signing out through the header user menu (`UserProfileMenu` →
// `LogoutMenuItem`): the session tokens must be dropped from localStorage and
// the private route must fall back to the auth wall again.
test.describe('Logout', () => {
  // Desktop: the header user menu is part of the desktop navigation
  test.use({ viewport: { width: 1280, height: 900 } });

  test('signing out clears the session and restores the auth wall', async ({
    page,
  }) => {
    test.skip(!hasCreds(), 'E2E_USER_EMAIL / E2E_USER_PASSWORD not set');

    await signInTestUser(page);

    // The signed-in header swaps the sign-in button for the profile menu; when
    // the CMS `user_menu` is unavailable it degrades to a bare profile link
    // and there is no logout item to exercise.
    const menu = page.getByTestId('user-menu');
    await expect(menu).toBeVisible({ timeout: 30_000 });

    // The session is on disk while signed in
    expect(
      await page.evaluate(() => localStorage.getItem('refresh-token')),
    ).toBeTruthy();

    // The dropdown opens on pointer-enter and is revealed by a GSAP height
    // tween, so wait for the item to actually be clickable
    await page.getByTestId('user-menu-trigger').hover();
    const logout = menu.getByTestId('logout-button');
    await expect(logout).toBeVisible({ timeout: 15_000 });
    await logout.click();

    // Redirected home — the visitor must not be left sitting on the private
    // page they just signed out of. Regression guard: the header lives outside
    // `<TransitionProvider>`, where `useTransitionRouter()` degrades to a no-op
    // `navigate`, so this push used to do nothing at all.
    await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });

    // Both auth keys go (`logOutUser` finally-block)
    await expect
      .poll(
        async () =>
          await page.evaluate(() => localStorage.getItem('refresh-token')),
        { timeout: 15_000 },
      )
      .toBeNull();
    expect(
      await page.evaluate(() => localStorage.getItem('authProviderMarker')),
    ).toBeNull();

    // The header reacts immediately: the profile menu is replaced by the
    // signed-out sign-in affordance
    await expect(page.getByTestId('user-menu')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Private route is gated again — the account view must not come back
    await page.goto('/profile');
    await expect(page.getByTestId('auth-required')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('profile-page')).toHaveCount(0);
  });
});
