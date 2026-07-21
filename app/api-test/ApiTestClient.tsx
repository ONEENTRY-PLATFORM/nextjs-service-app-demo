'use client';

import type { JSX } from 'react';

import BarChart from './components/BarChart';
import BenchmarkControls from './components/BenchmarkControls';
import FailuresPanel from './components/FailuresPanel';
import Histogram from './components/Histogram';
import Legend from './components/Legend';
import ResultsTable from './components/ResultsTable';
import RunHistoryTable from './components/RunHistoryTable';
import RunProgress from './components/RunProgress';
import StatsGrid from './components/StatsGrid';
import { useBenchmarkRun } from './useBenchmarkRun';

/**
 * ApiTestClient — dev-only OneEntry API benchmark dashboard.
 *
 * Lets the developer pick a preset (Pages / Menus / Blocks / Products), toggle the
 * cached server fetcher vs raw SDK call, choose sequential vs parallel execution,
 * and stream measurements into a live bar chart + histogram + metric grid. Runs
 * accumulate into an in-memory history pane for quick before/after comparison.
 *
 * All state and the probe pool live in {@link useBenchmarkRun}; this component
 * only lays the panels out.
 * @returns {JSX.Element} JSX of the benchmark dashboard.
 */
export default function ApiTestClient(): JSX.Element {
  const run = useBenchmarkRun();
  const failures = run.orderedResults.filter((r) => !r.success);

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-323 px-4 py-8 text-paper">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">OneEntry API Benchmark</h1>
          <p className="mt-1 text-sm text-paper/60">
            Dev dashboard for probing OneEntry endpoints.
          </p>
        </header>

        <BenchmarkControls run={run} />

        <RunProgress
          done={run.orderedResults.length}
          count={run.count}
          progress={run.progress}
          running={run.running}
        />

        <StatsGrid
          ok={run.successResults.length}
          failed={run.failed}
          stats={run.stats}
          serverStats={run.serverStats}
          totalBytes={run.totalBytes}
        />

        <section className="mt-6 rounded-panel border border-paper/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-fine text-paper/70 uppercase">
              Latency per request
            </h2>
            <Legend />
          </div>
          <BarChart results={run.orderedResults} />
        </section>

        <section className="mt-4 rounded-panel border border-paper/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold tracking-fine text-paper/70 uppercase">
            Distribution
          </h2>
          <Histogram results={run.orderedResults} />
        </section>

        {run.orderedResults.length > 0 && (
          <ResultsTable
            rows={run.tableRows}
            sort={run.tableSort}
            filter={run.tableFilter}
            onSortChange={run.setTableSort}
            onFilterChange={run.setTableFilter}
          />
        )}

        {failures.length > 0 && <FailuresPanel failures={failures} />}

        {run.runs.length > 0 && (
          <RunHistoryTable runs={run.runs} onClear={run.clearRuns} />
        )}
      </div>
    </div>
  );
}
