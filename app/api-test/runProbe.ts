import type { Preset, RequestResult } from './types';

/** Body the `/api/test-connection` route answers a probe with. */
type ProbeResponse = {
  success: boolean;
  responseTime?: number;
  size?: number;
  error?: string;
};

/**
 * runProbe — fires one benchmark request against the test-connection route.
 *
 * Times the call client-side, merges the server-reported `responseTime` (when present)
 * onto the result, and translates aborts / network failures into a non-throwing
 * `RequestResult` with `success: false` so the caller can keep iterating.
 * @param   {object}                 opts        - Request parameters.
 * @param   {number}                 opts.index  - 0-based ordering within the run.
 * @param   {Preset}                 opts.preset - Active preset.
 * @param   {string}                 opts.marker - Marker / pageUrl (may be empty for `products`).
 * @param   {boolean}                opts.cached - Whether to ask the route to use the cached server fetcher.
 * @param   {AbortSignal}            opts.signal - Signal used by the dashboard's Stop button.
 * @returns {Promise<RequestResult>}             Promise resolving to a `RequestResult` (always — failures don't throw).
 */
export const runProbe = async (opts: {
  index: number;
  preset: Preset;
  marker: string;
  cached: boolean;
  signal: AbortSignal;
}): Promise<RequestResult> => {
  const startedAt = Date.now();
  const t0 = performance.now();
  const url = `/api/test-connection?preset=${opts.preset}&marker=${encodeURIComponent(
    opts.marker,
  )}&cached=${opts.cached ? '1' : '0'}`;
  try {
    const res = await fetch(url, { signal: opts.signal, cache: 'no-store' });
    const body = (await res.json()) as ProbeResponse;
    const t1 = performance.now();
    const result: RequestResult = {
      index: opts.index,
      time: t1 - t0,
      success: !!body.success,
      startedAt,
    };
    if (typeof body.responseTime === 'number')
      result.serverTime = body.responseTime;
    if (typeof body.size === 'number') result.size = body.size;
    if (typeof body.error === 'string') result.error = body.error;
    return result;
  } catch (e) {
    const t1 = performance.now();
    const message = e instanceof Error ? e.message : 'request failed';
    return {
      index: opts.index,
      time: t1 - t0,
      success: false,
      error: message,
      startedAt,
    };
  }
};
