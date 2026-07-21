'use client';

import type { JSX } from 'react';

/**
 * RunProgress — the "N / M requests" counter and the completion bar of the run
 * currently in flight.
 * @param   {object}      props          - Component props.
 * @param   {number}      props.done     - Samples collected so far.
 * @param   {number}      props.count    - Samples the run was configured with.
 * @param   {number}      props.progress - Completion percentage, 0–100.
 * @param   {boolean}     props.running  - Whether a run is currently in flight.
 * @returns {JSX.Element}                JSX of the progress strip.
 */
const RunProgress = ({
  done,
  count,
  progress,
  running,
}: {
  done: number;
  count: number;
  progress: number;
  running: boolean;
}): JSX.Element => (
  <section className="mt-4">
    <div className="flex items-center justify-between text-xs text-paper/60">
      <span>
        {done} / {count} requests
        {running ? ' — running…' : ''}
      </span>
      <span className="tabular-nums">{progress.toFixed(0)}%</span>
    </div>
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-paper/10">
      <div
        className="h-full bg-brand transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  </section>
);

export default RunProgress;
