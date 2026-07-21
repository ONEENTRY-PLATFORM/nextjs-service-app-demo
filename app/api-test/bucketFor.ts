import type { Bucket } from './types';

/**
 * bucketFor — classifies a single sample into a `Bucket`.
 *
 * Failures (negative or non-finite times) collapse to `failed`. Successful samples
 * map onto five fixed bands aligned with `bucketLabel`.
 * @param   {number}  time    - Sample latency in ms (negative when the request failed).
 * @param   {boolean} success - Whether the request succeeded.
 * @returns {Bucket}          Latency bucket.
 */
export const bucketFor = (time: number, success: boolean): Bucket => {
  if (!success || !Number.isFinite(time) || time < 0) return 'failed';
  if (time < 50) return 'fast';
  if (time < 200) return 'ok';
  if (time < 500) return 'medium';
  if (time < 1000) return 'slow';
  return 'verySlow';
};
