/**
 * Shared shapes of the dev-only OneEntry API benchmark dashboard: what a run is
 * configured with, what a single probe returns and how finished runs are kept
 * in the history pane.
 */

/** Endpoint family the dashboard probes. */
export type Preset = 'page' | 'menu' | 'block' | 'products';

/** How the probes of one run are issued. */
export type Mode = 'sequential' | 'parallel';

/** Ordering of the per-request details table. */
export type TableSort = 'order' | 'slowest' | 'fastest';

/** Row filter of the per-request details table. */
export type TableFilter = 'all' | 'ok' | 'failed';

/** Qualitative latency band used for chart coloring. */
export type Bucket = 'fast' | 'ok' | 'medium' | 'slow' | 'verySlow' | 'failed';

/**
 * Stats — aggregate metrics derived from an array of latency samples.
 * @property {number} count  - Total successful samples.
 * @property {number} min    - Smallest sample (ms).
 * @property {number} max    - Largest sample (ms).
 * @property {number} mean   - Arithmetic mean (ms).
 * @property {number} median - 50th percentile (ms).
 * @property {number} p95    - 95th percentile (ms).
 * @property {number} p99    - 99th percentile (ms).
 * @property {number} std    - Population standard deviation (ms).
 */
export type Stats = {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  std: number;
};

/**
 * RequestResult — a single benchmark sample collected by the dashboard.
 * @property {number}  index        - 0-based ordering within the run.
 * @property {number}  time         - Client-observed total round-trip in ms (-1 on failure).
 * @property {number}  [serverTime] - Server-side response time reported by the route.
 * @property {boolean} success      - Whether the request returned `success: true`.
 * @property {number}  [size]       - Approximate response body size in bytes.
 * @property {string}  [error]      - Failure message, if any.
 * @property {number}  startedAt    - Epoch ms when the request was kicked off.
 */
export type RequestResult = {
  index: number;
  time: number;
  serverTime?: number;
  success: boolean;
  size?: number;
  error?: string;
  startedAt: number;
};

/**
 * RunSummary — completed (or interrupted) benchmark run, persisted in the history pane.
 * @property {string}          id           - Local-only unique id.
 * @property {string}          preset       - Preset that was tested.
 * @property {string}          marker       - Marker used by the preset (empty for `products`).
 * @property {boolean}         cached       - Whether the cached server fetcher was used.
 * @property {Mode}            mode         - Execution mode.
 * @property {number}          concurrency  - Effective concurrency level (1 for sequential).
 * @property {number}          count        - Total requests requested.
 * @property {RequestResult[]} results      - Individual samples.
 * @property {number}          startedAt    - Epoch ms when the run began.
 * @property {number}          [finishedAt] - Epoch ms when the run finished or was aborted.
 * @property {boolean}         [aborted]    - True when the run was stopped before completion.
 */
export type RunSummary = {
  id: string;
  preset: string;
  marker: string;
  cached: boolean;
  mode: Mode;
  concurrency: number;
  count: number;
  results: RequestResult[];
  startedAt: number;
  finishedAt?: number;
  aborted?: boolean;
};
