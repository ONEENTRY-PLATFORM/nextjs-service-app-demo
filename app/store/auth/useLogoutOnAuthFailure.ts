'use client';

import type { IError } from 'oneentry/dist/base/utils';
import { useEffect } from 'react';

import { readRefreshToken } from './authStorage';

/**
 * isAuthFailure — whether an SDK error is a CONFIRMED authentication failure
 * (401 / 403) rather than a transient one.
 *
 * The distinction is the whole point: per `rules/tokens.md` ("logout only on
 * confirmed 401/403") the refresh token may be dropped on a real auth failure,
 * but a network blip must keep it so the next poll can retry. Treating every
 * error as a failure signs the user out whenever their connection hiccups.
 * @param   {unknown} error - Error value from an RTK Query result
 * @returns {boolean}       `true` for 401 / 403 only
 */
export const isAuthFailure = (error: unknown): boolean => {
  const statusCode = (error as IError | undefined)?.statusCode;
  return statusCode === 401 || statusCode === 403;
};

/**
 * useLogoutOnAuthFailure — signs the user out when the session keepalive poll
 * reports a CONFIRMED auth failure.
 *
 * Polling through `useLazyGetMeQuery` exposes errors only as derived state
 * (`isError` / `error`), never through a callback, so the transition has to be
 * observed in an effect. `onAuthFailure` is deferred to a microtask so its state
 * updates run outside the effect's synchronous body (avoids React's
 * cascading-render warning).
 *
 * Per `rules/tokens.md` ("Race condition — logout only on confirmed 401/403"),
 * transient network errors must NOT end the session: polling retries on its own
 * next tick. A poll that errors while no refresh token is stored is ignored too
 * — there is no session left to end.
 * @param {object}     input               - Input
 * @param {boolean}    input.isError       - The keepalive poll is in an error state
 * @param {unknown}    input.error         - The error value from the poll
 * @param {() => void} input.onAuthFailure - Drop the session (runs in a microtask)
 */
export const useLogoutOnAuthFailure = ({
  isError,
  error,
  onAuthFailure,
}: {
  isError: boolean;
  error: unknown;
  onAuthFailure: () => void;
}): void => {
  useEffect(() => {
    if (!isError) return;
    if (!readRefreshToken()) return;
    if (!isAuthFailure(error)) return;

    queueMicrotask(onAuthFailure);
    // `onAuthFailure` is intentionally omitted — it is re-created on every
    // render of the provider, and depending on it would re-run the logout for
    // as long as the poll stays in its error state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, error]);
};
