/**
 * Unit tests for fetchCmsData (app/api/utils/fetchCmsData.ts) — the throw-vs-return
 * classification that keeps `unstable_cache` from ever storing a transient CMS
 * failure (which is what turned a brief CMS hiccup into a 60s window of cached
 * `notFound()` / empty sections).
 *
 * The module transitively imports the OneEntry SDK singleton (via `isError`), so
 * `oneentry` is stubbed to keep the test hermetic — no network, no real client.
 */
jest.mock('oneentry', () => ({
  defineOneEntry: jest.fn(() => ({})),
}));

import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

describe('fetchCmsData', () => {
  it('returns SDK data on success without retrying', async () => {
    const call = jest.fn(async () => ({ id: 1, pageUrl: 'home' }));

    await expect(fetchCmsData(call, 'test')).resolves.toEqual({
      id: 1,
      pageUrl: 'home',
    });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it.each([404, 400, 401, 403])(
    'returns a stable %d logical error without retrying (stays cacheable)',
    async (statusCode) => {
      const stable = { statusCode, message: 'stable' };
      const call = jest.fn(async () => stable);

      // Returned, NOT thrown — the caller shapes it into `{ isError, error }`
      // and `unstable_cache` is free to cache it: it will not change on retry.
      await expect(fetchCmsData(call, 'test')).resolves.toBe(stable);
      expect(call).toHaveBeenCalledTimes(1);
    },
  );

  it.each([500, 502, 503, 429, 408])(
    'throws on a transient %d status after exhausting retries',
    async (statusCode) => {
      const call = jest.fn(async () => ({ statusCode, message: 'transient' }));

      // Thrown → `unstable_cache` will not store it → no cache poisoning.
      await expect(fetchCmsData(call, 'test')).rejects.toMatchObject({
        statusCode,
      });
      expect(call).toHaveBeenCalledTimes(2); // default: 1 attempt + 1 retry
    },
  );

  it('rethrows a thrown / network error after retrying, preserving the original', async () => {
    const boom = new Error('ECONNRESET');
    const call = jest.fn(async () => {
      throw boom;
    });

    await expect(fetchCmsData(call, 'test')).rejects.toBe(boom);
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('recovers when a transient failure succeeds on retry', async () => {
    const call = jest
      .fn()
      .mockResolvedValueOnce({ statusCode: 503, message: 'blip' })
      .mockResolvedValueOnce({ id: 7 });

    await expect(fetchCmsData(call, 'test')).resolves.toEqual({ id: 7 });
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('times out a hung call, retries, then throws', async () => {
    const call = jest.fn(() => new Promise(() => {})); // never resolves

    await expect(fetchCmsData(call, 'test', { timeoutMs: 30 })).rejects.toThrow(
      /timed out/i,
    );
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('does not retry when retries is 0', async () => {
    const call = jest.fn(async () => ({ statusCode: 503 }));

    await expect(
      fetchCmsData(call, 'test', { retries: 0 }),
    ).rejects.toBeDefined();
    expect(call).toHaveBeenCalledTimes(1);
  });
});
