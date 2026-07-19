/** Default per-call ceiling for a single CMS/SDK round trip on the server. */
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * withTimeout — reject a pending SDK promise after `ms` so a slow or half-open
 * CMS connection cannot hang a server render indefinitely (the SDK exposes no
 * AbortSignal, so the underlying request keeps running in the background — this
 * only stops the *render* from awaiting it). The caller's existing try/catch
 * converts the rejection into the standard `{ isError, error }` envelope, so a
 * timeout degrades to the same graceful fallback as any other CMS failure.
 * @param   {Promise<T>} promise - The in-flight SDK call.
 * @param   {number}     ms      - Timeout in milliseconds (default 10 000).
 * @param   {string}     label   - Human label used in the timeout error message.
 * @returns {Promise<T>}         The promise result, or a rejection on timeout.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = DEFAULT_TIMEOUT_MS,
  label: string = 'CMS request',
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}
