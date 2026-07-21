'use client';

import type { JSX } from 'react';

import type { RunSummary } from '../types';
import RunHistoryRow from './RunHistoryRow';

const COLUMNS = [
  'Time',
  'Preset',
  'Marker',
  'Mode',
  'Cache',
  'N',
  'OK / Fail',
  'Mean',
  'p95',
  'Buckets',
];

/**
 * RunHistoryTable — the last ten finished runs, newest first, for quick
 * before/after comparison (raw vs cached, sequential vs parallel). The history
 * is in-memory only: it is dropped on reload or via Clear.
 * @param   {object}       props         - Component props.
 * @param   {RunSummary[]} props.runs    - Finished runs, newest first.
 * @param   {() => void}   props.onClear - Drop the whole history.
 * @returns {JSX.Element}                JSX of the history section.
 */
const RunHistoryTable = ({
  runs,
  onClear,
}: {
  runs: RunSummary[];
  onClear: () => void;
}): JSX.Element => (
  <section className="mt-6 rounded-panel border border-paper/10 bg-white/5 p-4">
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-fine text-paper/70 uppercase">
        Recent runs
      </h2>
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-paper/50 hover:text-paper"
      >
        Clear
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-180 text-left text-xs tabular-nums">
        <thead>
          <tr className="tracking-fine text-paper/50 uppercase">
            {COLUMNS.map((c) => (
              <th key={c} className="px-2 py-1 font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <RunHistoryRow key={r.id} run={r} />
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default RunHistoryTable;
