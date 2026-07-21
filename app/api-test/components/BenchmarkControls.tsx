'use client';

import type { JSX } from 'react';

import { COUNT_OPTIONS, PRESET_OPTIONS } from '../constants';
import type { BenchmarkRunState } from '../useBenchmarkRun';

/**
 * BenchmarkControls — the configuration panel of the benchmark dashboard:
 * preset pills, marker input, cache mode, execution mode + concurrency, run
 * size, and the Run / Stop / Export actions. Every control is disabled while a
 * run is in flight, so a run's configuration cannot change under it.
 * @param   {object}            props     - Component props.
 * @param   {BenchmarkRunState} props.run - Benchmark controller state and actions.
 * @returns {JSX.Element}                 JSX of the configuration panel.
 */
const BenchmarkControls = ({
  run,
}: {
  run: BenchmarkRunState;
}): JSX.Element => (
  <section className="grid gap-4 rounded-panel border border-paper/10 bg-white/5 p-4 md:grid-cols-2">
    <div>
      <div className="text-xs tracking-fine text-paper/50 uppercase">
        Preset
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRESET_OPTIONS.map((opt) => {
          const active = run.preset === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => run.selectPreset(opt.value)}
              className={`rounded-card border px-3 py-1.5 text-sm transition ${
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-paper/15 bg-transparent text-paper hover:border-paper/40'
              }`}
              disabled={run.running}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-paper/50">
        {PRESET_OPTIONS.find((o) => o.value === run.preset)?.hint}
      </p>
    </div>

    <div>
      <label
        className="text-xs tracking-fine text-paper/50 uppercase"
        htmlFor="marker"
      >
        Marker / pageUrl
      </label>
      <input
        id="marker"
        type="text"
        value={run.marker}
        onChange={(e) => run.setMarker(e.target.value)}
        disabled={run.running || run.preset === 'products'}
        placeholder={
          run.preset === 'products'
            ? '(not used for products)'
            : 'e.g. home_web'
        }
        className="mt-2 w-full rounded-card border border-paper/15 bg-black/30 px-3 py-1.5 text-sm placeholder:text-paper/30 focus:border-brand focus:outline-none disabled:opacity-50"
      />
    </div>

    <div>
      <div className="text-xs tracking-fine text-paper/50 uppercase">
        Cache mode
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => run.setCached(false)}
          disabled={run.running}
          className={`rounded-card border px-3 py-1.5 text-sm ${
            !run.cached
              ? 'border-brand bg-brand text-white'
              : 'border-paper/15 text-paper'
          }`}
        >
          Raw SDK
        </button>
        <button
          type="button"
          onClick={() => run.setCached(true)}
          disabled={run.running}
          className={`rounded-card border px-3 py-1.5 text-sm ${
            run.cached
              ? 'border-brand bg-brand text-white'
              : 'border-paper/15 text-paper'
          }`}
        >
          Cached fetcher
        </button>
      </div>
      <p className="mt-2 text-xs text-paper/50">
        Raw = direct <code className="text-paper/70">getApi()</code> call.
        Cached = project&apos;s{' '}
        <code className="text-paper/70">unstable_cache + cache()</code> wrapper.
      </p>
    </div>

    <div>
      <div className="text-xs tracking-fine text-paper/50 uppercase">
        Execution
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => run.setMode('sequential')}
          disabled={run.running}
          className={`rounded-card border px-3 py-1.5 text-sm ${
            run.mode === 'sequential'
              ? 'border-brand bg-brand text-white'
              : 'border-paper/15 text-paper'
          }`}
        >
          Sequential
        </button>
        <button
          type="button"
          onClick={() => run.setMode('parallel')}
          disabled={run.running}
          className={`rounded-card border px-3 py-1.5 text-sm ${
            run.mode === 'parallel'
              ? 'border-brand bg-brand text-white'
              : 'border-paper/15 text-paper'
          }`}
        >
          Parallel
        </button>
        {run.mode === 'parallel' && (
          <label className="flex items-center gap-2 text-xs text-paper/70">
            Concurrency
            <input
              type="number"
              min={1}
              max={32}
              value={run.concurrency}
              onChange={(e: { target: { value: string } }) =>
                run.setConcurrency(
                  Math.max(1, Math.min(32, Number(e.target.value) || 1)),
                )
              }
              disabled={run.running}
              className="w-16 rounded-card border border-paper/15 bg-black/30 px-2 py-1 text-sm tabular-nums focus:border-brand focus:outline-none disabled:opacity-50"
            />
          </label>
        )}
      </div>
    </div>

    <div className="flex flex-wrap items-end justify-between gap-3 md:col-span-2">
      <div>
        <div className="text-xs tracking-fine text-paper/50 uppercase">
          Requests
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => run.setCount(n)}
              disabled={run.running}
              className={`rounded-card border px-3 py-1.5 text-sm tabular-nums ${
                run.count === n
                  ? 'border-brand bg-brand text-white'
                  : 'border-paper/15 text-paper'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {run.running ? (
          <button
            type="button"
            onClick={run.stopRun}
            className="rounded-card border border-red-500/50 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/30"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={run.startRun}
            className="rounded-card border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Run benchmark
          </button>
        )}
        <button
          type="button"
          onClick={run.exportJson}
          disabled={!run.orderedResults.length}
          className="rounded-card border border-paper/15 bg-transparent px-4 py-2 text-sm text-paper hover:border-paper/40 disabled:opacity-40"
        >
          Export JSON
        </button>
      </div>
    </div>
  </section>
);

export default BenchmarkControls;
