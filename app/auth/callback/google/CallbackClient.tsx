'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { JSX } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { getApi } from '@/app/api/api/api';
import { googleOAuthAction } from '@/app/api/server/auth/googleOAuthAction';
import { parseOAuthState } from '@/app/auth/callback/google/parseOAuthState';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { useDict } from '@/app/store/providers/useDict';
import Spinner from '@/components/shared/Spinner';
import { dictText } from '@/components/utils/dictText';

/** Route path Google redirects back to — must equal the URI whitelisted in Console. */
const CALLBACK_PATH = '/auth/callback/google';

/**
 * Client half of the Google OAuth callback.
 *
 * Exchanges the `?code` Google appended to the redirect URL for OneEntry tokens
 * and signs the user in. The browser device fingerprint
 * (`getDeviceMetadata()`) is captured here and handed to the Server Action so
 * the refresh token binds to this browser, not the server (see
 * `googleOAuthAction`). Tokens then go through the shared `AuthContext.login()`
 * — the exact same path email sign-in uses — with the `google` provider marker.
 * Afterwards the user is returned to the page they signed in from, decoded from
 * the OAuth `state` param (`parseOAuthState`); `/` if it is missing or unsafe.
 * @returns {JSX.Element} Loading / error status UI
 */
const CallbackClient = (): JSX.Element => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const dict = useDict();
  const [error, setError] = useState<string | null>(null);
  /** StrictMode / re-render guard — the code is single-use, exchange it once. */
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    /** Page the user started from — Google echoes `state` back untouched. */
    const returnPath = parseOAuthState(searchParams.get('state'));

    if (errorParam || !code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(
        errorParam
          ? dictText(dict, 'err_auth_canceled', 'Authorization was canceled')
          : dictText(dict, 'err_no_auth_code', 'No authorization code'),
      );
      setTimeout(() => router.push(returnPath), 2500);
      return;
    }

    void (async () => {
      try {
        /**
         * Browser fingerprint for binding the refresh token (SDK >= 1.0.155).
         * `getDeviceMetadata()` is a method of each SDK module, not of the root
         * `getApi()` object.
         */
        const deviceMetadata = getApi().AuthProvider.getDeviceMetadata();
        /** Must equal the redirect_uri used to obtain the code (same origin). */
        const redirectUri = `${window.location.origin}${CALLBACK_PATH}`;

        const result = await googleOAuthAction(
          code,
          deviceMetadata,
          redirectUri,
        );

        if (result.isError || !result.token) {
          const rawMessage = result.error?.message;
          const message = Array.isArray(rawMessage)
            ? rawMessage.join('; ')
            : (rawMessage ??
              dictText(dict, 'err_google_sign_in', 'Google sign-in failed'));
          setError(message);
          setTimeout(() => router.push(returnPath), 3000);
          return;
        }

        /** Same token path as email auth — provider marker is `google`. */
        login({
          accessToken: result.token.accessToken,
          refreshToken: result.token.refreshToken,
          authProviderMarker: 'google',
        });
        toast(dictText(dict, 'you_signed_in_text', 'You signed in!'));
        router.push(returnPath);
      } catch {
        /**
         * Network failure / rejected Server Action — without this catch the
         * rejection is unhandled and the user is stuck on the spinner forever.
         * Same UX as the `result.isError` branch above.
         */
        setError(dictText(dict, 'err_google_sign_in', 'Google sign-in failed'));
        setTimeout(() => router.push(returnPath), 3000);
      }
    })();
  }, [searchParams, router, login, dict]);

  if (error) {
    return (
      <div
        data-testid="oauth-callback"
        className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center"
      >
        <p data-testid="oauth-error" className="text-lg text-red-500">
          {error}
        </p>
        <p className="text-sm text-neutral-300">
          {dictText(dict, 'redirecting_text', 'Redirecting…')}
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="oauth-callback"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <div className="relative size-8">
        <Spinner />
      </div>
      <p data-testid="oauth-loading" className="text-xl text-slate-400">
        {dictText(dict, 'logging_in_text', 'Logging in…')}
      </p>
    </div>
  );
};

export default CallbackClient;
