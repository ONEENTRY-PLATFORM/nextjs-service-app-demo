'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import { getApi, isError } from '@/app/api/api/api';
import GoogleIcon from '@/components/icons/google';

/**
 * "Sign in with Google" button — starts the OAuth redirect flow.
 *
 * On click it reads the OAuth authorization URL from the CMS provider
 * (`config.oauthAuthUrl`, never hardcoded — it may differ per provider) and
 * sends the browser to Google with the standard authorization-code params. The
 * `redirect_uri` is derived from `window.location.origin`, so the same code
 * works on dev (`http://localhost:3700`) and prod without env juggling — both
 * origins just need to be whitelisted in the Google Cloud Console.
 *
 * Google returns to `/auth/callback`, which exchanges the `code` for tokens via
 * the `googleOAuthAction` Server Action.
 * @param   {object}      props       - Component props
 * @param   {string}      props.title - Button label (default "Sign in with Google")
 * @returns {JSX.Element}             The Google sign-in button
 */
const GoogleSignInButton = ({
  title = 'Sign in with Google',
}: {
  title?: string;
}): JSX.Element => {
  /** Disable the button between the click and the full-page redirect. */
  const [loading, setLoading] = useState(false);

  /**
   * Build the Google authorization URL and redirect the browser to it.
   *
   * The base URL comes from the CMS provider config; the client id from env.
   * `access_type=offline` + `prompt=consent` ensure a refresh token is issued.
   */
  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      const provider =
        await getApi().AuthProvider.getAuthProviderByMarker('google');
      if (isError(provider)) {
        setLoading(false);
        return;
      }
      const baseUrl = provider.config?.oauthAuthUrl;
      if (!baseUrl) {
        setLoading(false);
        return;
      }
      const redirectUri = `${window.location.origin}/auth/callback/google`;
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
      });
      window.location.href = `${baseUrl}?${params.toString()}`;
    } catch {
      /** Network hiccup fetching the provider — let the user retry. */
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      data-testid="google-login-button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-solid border-slate-150 bg-white px-10 py-3 text-base font-medium text-slate-400 transition-transform duration-150 hover:scale-102 hover:border-fuchsia-300 focus-visible:outline-fuchsia-500 active:scale-97 disabled:opacity-60"
    >
      <GoogleIcon size={20} />
      {title}
    </button>
  );
};

export default GoogleSignInButton;
