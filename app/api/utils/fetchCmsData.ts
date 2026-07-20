import type { IError } from 'oneentry/dist/base/utils';

import { isError } from '@/app/api/api/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/** Per-attempt ceiling for the first try — parity with the previous inline `withTimeout`. */
const DEFAULT_TIMEOUT_MS = 10_000;
/** Retries get a shorter budget so a hard outage degrades in ~15s, not ~20s+. */
const RETRY_TIMEOUT_MS = 5_000;
/** One extra attempt: smooths a single CMS latency spike / transient 5xx. */
const DEFAULT_RETRIES = 1;
/** Linear backoff between attempts (attempt 1 → 300ms, attempt 2 → 600ms, …). */
const RETRY_BACKOFF_MS = 300;

/**
 * HTTP statuses that mean "try again", not "this is the answer". Anything else a
 * OneEntry endpoint returns (404 not found, 400 bad request, 401/403 auth) is a
 * STABLE logical result: retrying cannot change it, and it is safe to cache.
 * @param   {number}  status - The `statusCode` from an `IError` response
 * @returns {boolean}        `true` when the failure is transient / infrastructural
 */
const isTransientStatus = (status: number): boolean =>
  status >= 500 || status === 429 || status === 408 || status === 425;

/**
 * Sleep helper for backoff between retries.
 * @param   {number}        ms - Milliseconds to wait
 * @returns {Promise<void>}    Resolves after `ms`
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetchCmsData — run a single OneEntry SDK call with a timeout and a short retry,
 * classifying the outcome so the caller's `unstable_cache` never stores a
 * transient failure.
 *
 * The critical contract is the throw-vs-return split:
 * - **Returns** the raw SDK data on success, AND on a *stable* logical error
 * (an `IError` whose `statusCode` is a real answer like 404 / 400 / 401) — the
 * caller shapes it into its `{ isError, error }` envelope and `unstable_cache`
 * may cache it, because it will not change on the next request.
 * - **Throws** on a *transient* failure (a thrown timeout / network error, or an
 * `IError` with a 5xx / 429 / 408 status) after exhausting retries. A thrown
 * value is NOT stored by `unstable_cache`, so a brief CMS hiccup degrades for
 * the single unlucky request instead of poisoning the marker with a cached
 * `notFound()` / empty section for the whole revalidate window.
 *
 * Callers must wrap the cached function in a try/catch that converts this throw
 * back into their graceful `{ isError: true }` envelope — see the server
 * wrappers in `app/api/server/**`.
 * @param   {() => Promise<T>} call             - Thunk performing exactly one SDK request
 * @param   {string}           label            - Human label for timeout / failure messages
 * @param   {object}           [opts]           - Overrides
 * @param   {number}           [opts.timeoutMs] - First-attempt timeout (default 10 000)
 * @param   {number}           [opts.retries]   - Extra attempts after the first (default 1)
 * @returns {Promise<T>}                        The SDK data (success or stable `IError`)
 * @throws  {Error | IError}           On a transient failure once retries are spent
 */
export async function fetchCmsData<T>(
  call: () => Promise<T>,
  label: string,
  opts?: { timeoutMs?: number | undefined; retries?: number | undefined },
): Promise<T> {
  const baseTimeout = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = opts?.retries ?? DEFAULT_RETRIES;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const timeoutMs =
      attempt === 0 ? baseTimeout : Math.min(baseTimeout, RETRY_TIMEOUT_MS);
    try {
      const data = await withTimeout(call(), timeoutMs, label);
      /** A 5xx / 429 / 408 answer is infrastructural — treat it like a throw. */
      if (isError(data) && isTransientStatus(data.statusCode)) {
        lastError = data;
      } else {
        /** Success, or a stable logical error (404 / 400 / 401 / 403). */
        return data;
      }
    } catch (e) {
      /** Timeout, network error, or the SDK itself throwing. */
      lastError = e;
    }

    if (attempt < retries) {
      await sleep(RETRY_BACKOFF_MS * (attempt + 1));
    }
  }

  /** Retries exhausted on a transient failure — throw so `unstable_cache` skips it. */
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw Object.assign(
    new Error(`${label} failed after ${retries + 1} attempts`),
    {
      cause: lastError,
      statusCode: (lastError as IError | undefined)?.statusCode,
    },
  );
}
