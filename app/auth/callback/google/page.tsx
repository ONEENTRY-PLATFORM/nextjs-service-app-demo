import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { dictText } from '@/components/utils/dictText';

import CallbackClient from './CallbackClient';

/**
 * Google OAuth callback route (`/auth/callback/google`).
 *
 * The path is namespaced per provider (`/google`) to match the redirect URI
 * registered in the Google Cloud Console and to leave room for other providers.
 *
 * The interactive logic lives in `CallbackClient` (it reads `?code` via
 * `useSearchParams`, which Next requires to sit inside a Suspense boundary).
 * This server wrapper just provides that boundary.
 * @returns {JSX.Element} The callback page
 */
const GoogleAuthCallbackPage = (): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-xl text-slate-400">
          {dictText(dict, 'logging_in_text', 'Logging in…')}
        </div>
      }
    >
      <CallbackClient />
    </Suspense>
  );
};

export default GoogleAuthCallbackPage;
