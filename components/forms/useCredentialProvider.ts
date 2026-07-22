'use client';

import type { IAuthProvidersEntity } from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import { useMemo } from 'react';

import { useGetAuthProvidersQuery } from '@/app/api/api/RTKApi';

/** The credential (non-OAuth) auth providers, decoded once for the forms. */
export interface CredentialProviders {
  /** First credential provider — drives sign-up and OTP config. `undefined` while loading. */
  provider: IAuthProvidersEntity | undefined;
  /** Identifiers of every credential provider — SignIn renders one tab each. Falls back to `['email']`. */
  identifiers: string[];
  /** `provider.identifier`, falling back to `'email'` (the current CMS value). */
  marker: string;
  /** `provider.formIdentifier`, falling back to `'reg'`. */
  formIdentifier: string;
}

/**
 * useCredentialProvider — read the CMS auth providers and pick the credential
 * (non-OAuth) ones.
 *
 * SignIn, SignUp and Verification each derived this from
 * `useGetAuthProvidersQuery` in a slightly different way — a filtered list, a
 * `find(type !== 'oauth')`, and a hardcoded `find(identifier === 'email')`.
 * They agree in practice (the CMS has one credential provider, `email`), so this
 * hook returns all three shapes from one place: the list for the sign-in tabs,
 * the first provider for OTP config, and its markers with the same
 * `email`/`reg` fallbacks the forms already used while the query loads.
 *
 * OAuth providers (Google) are handled by a separate button and never appear
 * here — hardcoding a credential marker used to break the sign-in tab.
 * @returns {CredentialProviders} The credential providers and their derived markers
 */
export const useCredentialProvider = (): CredentialProviders => {
  const { data: authProviders } = useGetAuthProvidersQuery('en_US');

  return useMemo(() => {
    const credentials = (authProviders ?? []).filter((p) => p.type !== 'oauth');
    const provider = credentials[0];
    return {
      provider,
      identifiers:
        credentials.length > 0
          ? credentials.map((p) => p.identifier)
          : ['email'],
      marker: provider?.identifier ?? 'email',
      formIdentifier: provider?.formIdentifier ?? 'reg',
    };
  }, [authProviders]);
};
