'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { PAGES } from '@/app/utils/constants';

import { computeStats } from './computeStats';
import { PRESET_OPTIONS } from './constants';
import { runProbe } from './runProbe';
import type {
  Mode,
  Preset,
  RequestResult,
  RunSummary,
  Stats,
  TableFilter,
  TableSort,
} from './types';

/**
 * Everything the dashboard renders from, plus the actions its controls fire.
 * @property {Preset}                        preset         - Active endpoint family
 * @property {string}                        marker         - Marker / pageUrl the preset probes (unused for `products`)
 * @property {boolean}                       cached         - Probe the cached server fetcher instead of the raw SDK call
 * @property {number}                        count          - How many requests one run issues
 * @property {Mode}                          mode           - Sequential or a parallel worker pool
 * @property {number}                        concurrency    - Worker-pool size in parallel mode
 * @property {boolean}                       running        - A run is in flight
 * @property {RequestResult[]}               orderedResults - Samples of the current run, in probe order
 * @property {RequestResult[]}               successResults - The successful subset of {@link orderedResults}
 * @property {number}                        failed         - Number of failed samples
 * @property {Stats | null}                  stats          - Client-latency aggregates, `null` before the first success
 * @property {Stats | null}                  serverStats    - Server-reported-latency aggregates, `null` when the route reports none
 * @property {number}                        totalBytes     - Summed response body size across successful samples
 * @property {number}                        progress       - Completion of the current run, 0–100
 * @property {RunSummary[]}                  runs           - The last ten finished runs, newest first
 * @property {RequestResult[]}               tableRows      - Rows of the details table after sorting and filtering
 * @property {TableSort}                     tableSort      - Active ordering of the details table
 * @property {TableFilter}                   tableFilter    - Active row filter of the details table
 * @property {(marker: string) => void}      setMarker      - Set the probed marker
 * @property {(cached: boolean) => void}     setCached      - Toggle the cached server fetcher
 * @property {(count: number) => void}       setCount       - Set the request count of a run
 * @property {(mode: Mode) => void}          setMode        - Set the execution mode
 * @property {(concurrency: number) => void} setConcurrency - Set the worker-pool size
 * @property {(sort: TableSort) => void}     setTableSort   - Set the details-table ordering
 * @property {(filter: TableFilter) => void} setTableFilter - Set the details-table row filter
 * @property {(preset: Preset) => void}      selectPreset   - Switch preset, resetting the marker to that preset's default
 * @property {() => void}                    startRun       - Start a run
 * @property {() => void}                    stopRun        - Abort the run in flight
 * @property {() => void}                    clearRuns      - Drop the run history
 * @property {() => void}                    exportJson     - Download the current run plus the history as JSON
 */
export interface BenchmarkRunState {
  preset: Preset;
  marker: string;
  cached: boolean;
  count: number;
  mode: Mode;
  concurrency: number;
  running: boolean;
  orderedResults: RequestResult[];
  successResults: RequestResult[];
  failed: number;
  stats: Stats | null;
  serverStats: Stats | null;
  totalBytes: number;
  progress: number;
  runs: RunSummary[];
  tableRows: RequestResult[];
  tableSort: TableSort;
  tableFilter: TableFilter;
  setMarker: (marker: string) => void;
  setCached: (cached: boolean) => void;
  setCount: (count: number) => void;
  setMode: (mode: Mode) => void;
  setConcurrency: (concurrency: number) => void;
  setTableSort: (sort: TableSort) => void;
  setTableFilter: (filter: TableFilter) => void;
  selectPreset: (preset: Preset) => void;
  startRun: () => void;
  stopRun: () => void;
  clearRuns: () => void;
  exportJson: () => void;
}

/**
 * useBenchmarkRun — the controller of the dev-only OneEntry benchmark: run
 * configuration, the probe pool that fills it, the derived aggregates and the
 * in-memory history of finished runs. Sequential mode awaits each probe in
 * turn; parallel mode runs a pool of `concurrency` async loops over a shared
 * counter. Stop is honoured via `AbortController`, so an aborted run still
 * lands in the history marked as such.
 * @returns {BenchmarkRunState} Run state, derived metrics and the control actions
 */
export const useBenchmarkRun = (): BenchmarkRunState => {
  const [preset, setPreset] = useState<Preset>('page');
  const [marker, setMarker] = useState<string>(PAGES.home);
  const [cached, setCached] = useState<boolean>(false);
  const [count, setCount] = useState<number>(20);
  const [mode, setMode] = useState<Mode>('sequential');
  const [concurrency, setConcurrency] = useState<number>(4);
  const [running, setRunning] = useState<boolean>(false);
  const [results, setResults] = useState<RequestResult[]>([]);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [tableSort, setTableSort] = useState<TableSort>('order');
  const [tableFilter, setTableFilter] = useState<TableFilter>('all');
  const abortRef = useRef<AbortController | null>(null);

  const selectPreset = useCallback((p: Preset) => {
    setPreset(p);
    const opt = PRESET_OPTIONS.find((o) => o.value === p);
    setMarker(opt?.defaultMarker ?? '');
  }, []);

  const startRun = useCallback(async (): Promise<void> => {
    if (running) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRunning(true);
    setResults([]);
    const startedAt = Date.now();
    const effectiveConcurrency =
      mode === 'parallel' ? Math.max(1, Math.min(concurrency, count)) : 1;

    const collected: RequestResult[] = [];
    let nextIndex = 0;

    /**
     * dispatchNext — pulls the next index from a shared counter and probes it.
     *
     * Used by both sequential (one worker) and parallel (N workers) paths.
     * Streams each result both into the shared `collected` array (for the final
     * summary) and into React state (for the live UI).
     * @returns {Promise<boolean>} `false` when the run is exhausted or aborted; `true` after a probe.
     */
    const dispatchNext = async (): Promise<boolean> => {
      if (ctrl.signal.aborted) return false;
      const i = nextIndex++;
      if (i >= count) return false;
      const r = await runProbe({
        index: i,
        preset,
        marker,
        cached,
        signal: ctrl.signal,
      });
      collected.push(r);
      setResults((prev) => [...prev, r]);
      return true;
    };

    /**
     * worker — one async loop of the probe pool: keeps pulling work through
     * `dispatchNext` until the run is exhausted or aborted. `concurrency` of
     * these run concurrently in parallel mode (a single one in sequential mode).
     * @returns {Promise<void>} Resolves once no indices remain to probe.
     */
    const worker = async (): Promise<void> => {
      while (await dispatchNext()) {
        // loop drains until exhausted or aborted
      }
    };

    const workers = Array.from({ length: effectiveConcurrency }, worker);
    await Promise.all(workers);

    const summary: RunSummary = {
      id: `run-${startedAt}-${Math.random().toString(36).slice(2, 7)}`,
      preset,
      marker,
      cached,
      mode,
      concurrency: effectiveConcurrency,
      count,
      results: collected.slice().sort((a, b) => a.index - b.index),
      startedAt,
      finishedAt: Date.now(),
      aborted: ctrl.signal.aborted,
    };
    setRuns((prev) => [summary, ...prev].slice(0, 10));
    setRunning(false);
    abortRef.current = null;
  }, [running, mode, concurrency, count, preset, marker, cached]);

  const stopRun = useCallback((): void => {
    abortRef.current?.abort();
  }, []);

  const clearRuns = useCallback((): void => {
    setRuns([]);
  }, []);

  const orderedResults = useMemo(
    () => [...results].sort((a, b) => a.index - b.index),
    [results],
  );

  const successResults = useMemo(
    () => orderedResults.filter((r) => r.success),
    [orderedResults],
  );
  const stats = useMemo(
    () => computeStats(successResults.map((r) => r.time)),
    [successResults],
  );
  const serverStats = useMemo(
    () =>
      computeStats(
        successResults
          .map((r) => r.serverTime)
          .filter((v): v is number => typeof v === 'number'),
      ),
    [successResults],
  );
  const failed = orderedResults.length - successResults.length;
  const totalBytes = useMemo(
    () => successResults.reduce((acc, r) => acc + (r.size ?? 0), 0),
    [successResults],
  );
  const progress =
    count > 0 ? Math.min(100, (orderedResults.length / count) * 100) : 0;

  const tableRows = useMemo(() => {
    let rows = orderedResults.slice();
    if (tableFilter === 'ok') rows = rows.filter((r) => r.success);
    else if (tableFilter === 'failed') rows = rows.filter((r) => !r.success);
    if (tableSort === 'slowest') {
      rows.sort((a, b) => {
        if (a.success !== b.success) return a.success ? 1 : -1;
        return b.time - a.time;
      });
    } else if (tableSort === 'fastest') {
      rows.sort((a, b) => {
        if (a.success !== b.success) return a.success ? -1 : 1;
        return a.time - b.time;
      });
    }
    return rows;
  }, [orderedResults, tableFilter, tableSort]);

  const exportJson = useCallback((): void => {
    const payload = {
      exportedAt: new Date().toISOString(),
      current: {
        preset,
        marker,
        cached,
        mode,
        concurrency: mode === 'parallel' ? concurrency : 1,
        count,
        results: orderedResults,
        stats,
      },
      history: runs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oneentry-api-benchmark-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [
    preset,
    marker,
    cached,
    mode,
    concurrency,
    count,
    orderedResults,
    stats,
    runs,
  ]);

  return {
    preset,
    marker,
    cached,
    count,
    mode,
    concurrency,
    running,
    orderedResults,
    successResults,
    failed,
    stats,
    serverStats,
    totalBytes,
    progress,
    runs,
    tableRows,
    tableSort,
    tableFilter,
    setMarker,
    setCached,
    setCount,
    setMode,
    setConcurrency,
    setTableSort,
    setTableFilter,
    selectPreset,
    startRun: () => void startRun(),
    stopRun,
    clearRuns,
    exportJson,
  };
};
