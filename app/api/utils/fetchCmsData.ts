import type { IError } from 'oneentry/dist/base/utils';

import { isError } from '@/app/api/api/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/**
 * `next build` sets `NEXT_PHASE` to this while it prerenders every `force-static`
 * route. Those reads run on a CI runner — far from the CMS and firing a burst of
 * requests as the whole site is generated at once — so a transient timeout / 429
 * there is NOT degraded for one unlucky request: it is baked into the static HTML
 * as a permanently empty section (empty header menu, missing hero, catalog
 * placeholders) until the next successful ISR pass regenerates the page.
 *
 * Runtime (`next start`) reads come one-at-a-time from the app server sitting
 * next to the CMS and virtually never flake, so the build gets a much larger
 * resilience budget (longer timeout, more retries, bounded concurrency) while
 * runtime keeps the tight one that keeps live requests fast.
 */
const IS_BUILD_PHASE = process.env.NEXT_PHASE === 'phase-production-build';

/** Per-attempt ceiling for the first try. The build waits longer per round trip. */
const DEFAULT_TIMEOUT_MS = IS_BUILD_PHASE ? 30_000 : 10_000;
/** Retries get a shorter budget at runtime; the build keeps them just as generous. */
const RETRY_TIMEOUT_MS = IS_BUILD_PHASE ? 30_000 : 5_000;
/** Extra attempts after the first: 5 total on the build to ride out a spike, 2 at runtime. */
const DEFAULT_RETRIES = IS_BUILD_PHASE ? 4 : 1;
/** Base backoff, grown exponentially per attempt (see {@link backoffFor}). */
const RETRY_BACKOFF_MS = IS_BUILD_PHASE ? 500 : 300;

/**
 * Cap on concurrent live CMS calls during the build. Next prerenders many static
 * pages in parallel, so without a cap the runner opens a burst of sockets to the
 * CMS at once and trips its rate limiter (429) / exhausts the timeout — the very
 * failures that bake empty sections into the deploy. `0` (runtime) means no cap:
 * live requests are low-volume and must never queue behind one another.
 */
const BUILD_CONCURRENCY = IS_BUILD_PHASE ? 6 : 0;

/** Live calls currently holding a slot, and the queue of waiters once the cap is hit. */
let inFlight = 0;
const waiters: Array<() => void> = [];

/**
 * acquireSlot — hold a concurrency slot before a live CMS call during the build.
 *
 * A no-op at runtime (`BUILD_CONCURRENCY === 0`). When the build cap is reached
 * the caller parks in {@link waiters} until {@link releaseSlot} hands it the
 * freed slot directly (so `inFlight` never exceeds the cap and is never
 * double-counted).
 * @returns {Promise<void>} Resolves once the caller holds a slot
 */
const acquireSlot = async (): Promise<void> => {
  if (BUILD_CONCURRENCY === 0) return;
  if (inFlight < BUILD_CONCURRENCY) {
    inFlight++;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
};

/**
 * releaseSlot — give up a concurrency slot after a live CMS call during the build.
 *
 * A no-op at runtime. Hands the freed slot straight to the next waiter when one
 * is queued (leaving `inFlight` unchanged — the slot simply changes owner),
 * otherwise decrements the in-flight count.
 * @returns {void}
 */
const releaseSlot = (): void => {
  if (BUILD_CONCURRENCY === 0) return;
  const next = waiters.shift();
  if (next) {
    next();
  } else {
    inFlight--;
  }
};

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
 * backoffFor — exponential backoff between retries, with jitter during the build.
 *
 * Runtime keeps a plain exponential curve; the build adds ±25% jitter so a burst
 * of parallel retries after a 429 does not resynchronise into a second stampede.
 * @param   {number} attempt - Zero-based index of the attempt that just failed
 * @returns {number}         Milliseconds to wait before the next attempt
 */
const backoffFor = (attempt: number): number => {
  const base = RETRY_BACKOFF_MS * 2 ** attempt;
  if (!IS_BUILD_PHASE) return base;
  const jitter = base * 0.25 * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(base + jitter));
};

/**
 * Sleep helper for backoff between retries.
 * @param   {number}        ms - Milliseconds to wait
 * @returns {Promise<void>}    Resolves after `ms`
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetchCmsData — run a single OneEntry SDK call with a timeout and short retries,
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
 * The timeout / retry / concurrency budget scales with {@link IS_BUILD_PHASE}:
 * the build (CI runner, far from the CMS, generating the whole site at once)
 * waits longer, retries harder, and is capped to {@link BUILD_CONCURRENCY}
 * simultaneous calls so it cannot stampede the CMS into the failures it is
 * trying to survive; runtime keeps the tight budget that keeps live pages fast.
 *
 * Callers must wrap the cached function in a try/catch that converts this throw
 * back into their graceful `{ isError: true }` envelope — see the server
 * wrappers in `app/api/server/**`.
 * @param   {() => Promise<T>} call             - Thunk performing exactly one SDK request
 * @param   {string}           label            - Human label for timeout / failure messages
 * @param   {object}           [opts]           - Overrides
 * @param   {number}           [opts.timeoutMs] - First-attempt timeout (default 30 000 on build, 10 000 at runtime)
 * @param   {number}           [opts.retries]   - Extra attempts after the first (default 4 on build, 1 at runtime)
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

  // Bound how many live calls hit the CMS at once during the build; a no-op at
  // runtime. Held for the whole retry sequence and always released in `finally`.
  await acquireSlot();
  try {
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
        await sleep(backoffFor(attempt));
      }
    }

    /**
     * Retries exhausted on a transient failure. During the build, surface which
     * read flaked so the CI log names the section that risks baking in empty —
     * the caller's catch still degrades it, so this never fails the build.
     */
    if (IS_BUILD_PHASE) {
      const status = (lastError as IError | undefined)?.statusCode;
      // eslint-disable-next-line no-console -- the build log is the only place this diagnostic can surface
      console.warn(
        `[cms] ${label}: all ${retries + 1} attempts failed during build` +
          `${status ? ` (last status ${status})` : ''} — section may render empty`,
      );
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
  } finally {
    releaseSlot();
  }
}
