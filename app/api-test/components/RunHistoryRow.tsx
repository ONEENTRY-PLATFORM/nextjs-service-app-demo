'use client';

import type { JSX } from 'react';

import { bucketFor } from '../bucketFor';
import { computeStats } from '../computeStats';
import { bucketColor } from '../constants';
import { formatMs } from '../formatMs';
import type { RunSummary } from '../types';

/**
 * RunHistoryRow — one finished run in the history pane: its configuration, the
 * OK / fail split (with a "stopped" badge when it was aborted), mean and p95,
 * and a compact bucket strip that shows the shape of the run at a glance.
 * @param   {object}      props     - Component props.
 * @param   {RunSummary}  props.run - The finished run to render.
 * @returns {JSX.Element}           JSX `<tr>` of the run.
 */
const RunHistoryRow = ({ run }: { run: RunSummary }): JSX.Element => {
  const stats = computeStats(
    run.results.filter((x) => x.success).map((x) => x.time),
  );
  const ok = run.results.filter((x) => x.success).length;

  return (
    <tr className="border-t border-paper/5">
      <td className="px-2 py-1 text-paper/70">
        {new Date(run.startedAt).toLocaleTimeString()}
      </td>
      <td className="px-2 py-1">{run.preset}</td>
      <td className="px-2 py-1 text-paper/70">{run.marker || '—'}</td>
      <td className="px-2 py-1">
        {run.mode === 'parallel' ? `par×${run.concurrency}` : 'seq'}
      </td>
      <td className="px-2 py-1">{run.cached ? 'cached' : 'raw'}</td>
      <td className="px-2 py-1">{run.count}</td>
      <td className="px-2 py-1">
        <span className="text-emerald-300">{ok}</span>
        <span className="text-paper/40"> / </span>
        <span className={ok < run.count ? 'text-red-300' : 'text-paper/40'}>
          {run.count - ok}
        </span>
        {run.aborted && (
          <span className="ml-1 rounded bg-paper/10 px-1 text-[10px] text-paper/60">
            stopped
          </span>
        )}
      </td>
      <td className="px-2 py-1">{stats ? formatMs(stats.mean) : '—'}</td>
      <td className="px-2 py-1">{stats ? formatMs(stats.p95) : '—'}</td>
      <td className="px-2 py-1">
        <div className="flex h-3 w-32 overflow-hidden rounded-sm">
          {run.results.map((req, i) => (
            <span
              key={i}
              style={{
                backgroundColor: bucketColor[bucketFor(req.time, req.success)],
                width: `${100 / Math.max(1, run.results.length)}%`,
              }}
            />
          ))}
        </div>
      </td>
    </tr>
  );
};

export default RunHistoryRow;
