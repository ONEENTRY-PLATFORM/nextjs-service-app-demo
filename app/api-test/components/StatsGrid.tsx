'use client';

import type { JSX } from 'react';

import { formatBytes } from '../formatBytes';
import { formatMs } from '../formatMs';
import type { Stats } from '../types';
import Stat from './Stat';

/**
 * StatsGrid — the metric pills summarising the current run: success/failure
 * counts, the client-latency distribution (min → max, std dev), the
 * server-reported p95 and the total payload size. Every pill carries a tooltip
 * explaining what the metric means.
 * @param   {object}       props             - Component props.
 * @param   {number}       props.ok          - Number of successful samples.
 * @param   {number}       props.failed      - Number of failed samples.
 * @param   {Stats | null} props.stats       - Client-latency aggregates, `null` before the first success.
 * @param   {Stats | null} props.serverStats - Server-reported-latency aggregates.
 * @param   {number}       props.totalBytes  - Summed response body size across successful samples.
 * @returns {JSX.Element}                    JSX of the metric grid.
 */
const StatsGrid = ({
  ok,
  failed,
  stats,
  serverStats,
  totalBytes,
}: {
  ok: number;
  failed: number;
  stats: Stats | null;
  serverStats: Stats | null;
  totalBytes: number;
}): JSX.Element => (
  <section className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
    <Stat
      label="OK"
      value={`${ok}`}
      tone="text-emerald-300"
      tooltip="Number of successful requests (HTTP 200 with success:true in the body)."
    />
    <Stat
      label="Failed"
      value={`${failed}`}
      tone={failed ? 'text-red-300' : 'text-paper/70'}
      tooltip="Requests that errored out — network failure, abort, HTTP error, or success:false."
    />
    <Stat
      label="Min"
      value={stats ? formatMs(stats.min) : '—'}
      tooltip="Fastest successful request. Useful as the best-case lower bound."
    />
    <Stat
      label="Mean"
      value={stats ? formatMs(stats.mean) : '—'}
      tooltip="Arithmetic mean of all successful latencies. Sensitive to outliers — compare against the median."
    />
    <Stat
      label="Median"
      value={stats ? formatMs(stats.median) : '—'}
      tooltip="50th percentile: half of the requests are faster, half slower. More robust to outliers than the mean."
    />
    <Stat
      label="p95"
      value={stats ? formatMs(stats.p95) : '—'}
      tooltip="95th percentile: 95% of requests complete at or below this value. A common SLO target."
    />
    <Stat
      label="p99"
      value={stats ? formatMs(stats.p99) : '—'}
      tooltip="99th percentile — the distribution's tail. Shows how bad the slowest 1% of requests get."
    />
    <Stat
      label="Max"
      value={stats ? formatMs(stats.max) : '—'}
      tooltip="Slowest successful request — peak latency in this sample."
    />
    <Stat
      label="Std dev"
      value={stats ? formatMs(stats.std) : '—'}
      tooltip="Standard deviation. The larger it is, the more latencies are scattered around the mean (less stable)."
    />
    <Stat
      label="Server p95"
      value={serverStats ? formatMs(serverStats.p95) : '—'}
      tone="text-paper/70"
      tooltip="p95 of the server-reported responseTime (route handler only, no network RTT). Gap vs client p95 = network overhead + browser/JSON parse."
    />
    <Stat
      label="Payload"
      value={formatBytes(totalBytes)}
      tone="text-paper/70"
      tooltip="Total response body size across all successful requests (approximate — measured as the JSON string length in bytes)."
    />
  </section>
);

export default StatsGrid;
