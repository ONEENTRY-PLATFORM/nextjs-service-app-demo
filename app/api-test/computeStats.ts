import type { Stats } from './types';

/**
 * computeStats — derives summary metrics (min/mean/median/p95/p99/max/std) from raw latencies.
 *
 * Sorts a copy of the input once, then reads order-statistics from the sorted view.
 * Percentiles use the nearest-rank method (floor((p/100) * n), clamped to n-1).
 * @param   {number[]}     times - Latency samples in milliseconds.
 * @returns {Stats | null}       Aggregate `Stats` or `null` when the input is empty.
 */
export const computeStats = (times: number[]): Stats | null => {
  if (!times.length) return null;
  const sorted = [...times].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0]!;
  const max = sorted[n - 1]!;
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  /**
   * percentile — nearest-rank sample: sorted[floor((p / 100) * n)], clamped to [0, n-1].
   * @param   {number} p - Percentile rank between 0 and 100.
   * @returns {number}   Sample value (ms) at that percentile.
   */
  const percentile = (p: number): number =>
    sorted[Math.min(n - 1, Math.max(0, Math.floor((p / 100) * n)))]!;
  const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  return {
    count: n,
    min,
    max,
    mean,
    median: percentile(50),
    p95: percentile(95),
    p99: percentile(99),
    std: Math.sqrt(variance),
  };
};
