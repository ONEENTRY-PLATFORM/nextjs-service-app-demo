import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import { cache } from 'react';

import { isError } from '@/app/api/api/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/** Envelope of a cached read, before the wrapper renames `data` to its domain key. */
export interface CmsReadResult<TData> {
  isError: boolean;
  error?: IError;
  data?: TData;
}

/**
 * Cache keys already handed out, so a copy-pasted one fails loudly.
 *
 * This guard is the price of sharing the callback body. `unstable_cache` derives
 * its cache key from the key array AND the function it wraps; with sixteen
 * separately-written closures the bodies differed, so a duplicated key array
 * still produced distinct entries. Once every reader shares this one closure the
 * key array is all that separates them — a duplicate would silently serve one
 * marker's payload for another.
 */
const claimedKeys = new Set<string>();

/**
 * createCachedCmsReader — build the caching layer every OneEntry read repeats.
 *
 * Sixteen wrappers in `app/api/server/**` carried the same three layers by hand:
 * `unstable_cache` for the cross-request TTL, React `cache()` for request-level
 * dedupe, and a `try/catch` turning a transient throw back into an envelope.
 * The catch comment was word-for-word identical in fifteen of them, and three
 * separate commits had to walk every file to change one line.
 *
 * What stays with each wrapper is its public signature and its domain key
 * (`page` / `block` / `products` / …), per the project's envelope convention —
 * this returns the payload under the neutral `data`, and the wrapper renames it
 * in one line.
 *
 * The reader NEVER throws: a transient failure (timeout, 5xx, network) is not
 * stored by `unstable_cache`, so it degrades for the current request only and
 * the next one retries, instead of serving a cache-poisoned empty result for the
 * whole revalidate window.
 * @param   {object}                                            input            - Reader definition
 * @param   {string}                                            input.cacheKey   - Unique `unstable_cache` key; duplicates throw at module load
 * @param   {string}                                            input.label      - Human label used in timeout / failure messages
 * @param   {number}                                            input.revalidate - Cross-request TTL in seconds
 * @param   {string[]}                                          input.tags       - `revalidateTag` tags of the entry
 * @param   {(...args: TArgs) => Promise<TData | IError>}       input.call       - Thunk performing exactly one SDK request
 * @returns {(...args: TArgs) => Promise<CmsReadResult<TData>>}                  Cached reader
 */
export const createCachedCmsReader = <TArgs extends unknown[], TData>({
  cacheKey,
  label,
  revalidate,
  tags,
  call,
}: {
  cacheKey: string;
  label: string;
  revalidate: number;
  tags: string[];
  call: (...args: TArgs) => Promise<TData | IError>;
}): ((...args: TArgs) => Promise<CmsReadResult<TData>>) => {
  if (claimedKeys.has(cacheKey)) {
    throw new Error(
      `createCachedCmsReader: duplicate cache key "${cacheKey}" — every reader shares one closure, so a repeated key would serve another reader's payload.`,
    );
  }
  claimedKeys.add(cacheKey);

  /** Cross-request cache with a TTL and invalidation tags. */
  const impl = unstable_cache(
    async (...args: TArgs): Promise<CmsReadResult<TData>> => {
      const data = await fetchCmsData(() => call(...args), label);
      if (isError(data)) {
        return { isError: true, error: data };
      }
      return { isError: false, data: data as TData };
    },
    [cacheKey],
    { revalidate, tags },
  );

  /** Request-level dedupe over the cross-request cache. */
  const cached = cache(impl);

  return async (...args: TArgs): Promise<CmsReadResult<TData>> => {
    try {
      return await cached(...args);
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  };
};
