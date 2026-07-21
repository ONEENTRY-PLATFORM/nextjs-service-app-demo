'use client';

import type { JSX } from 'react';

import type { RequestResult } from '../types';

/**
 * FailuresPanel — the first ten failed probes of the run with their error
 * messages, so a broken marker or a dropped connection is visible without
 * scanning the details table.
 * @param   {object}          props          - Component props.
 * @param   {RequestResult[]} props.failures - The failed samples of the run.
 * @returns {JSX.Element}                    JSX of the failures section.
 */
const FailuresPanel = ({
  failures,
}: {
  failures: RequestResult[];
}): JSX.Element => (
  <section className="mt-4 rounded-panel border border-red-500/30 bg-red-500/10 p-4">
    <h2 className="mb-2 text-sm font-semibold text-red-200">Failures</h2>
    <ul className="space-y-1 text-xs text-red-100">
      {failures.slice(0, 10).map((r) => (
        <li key={r.index} className="font-mono">
          #{r.index + 1}: {r.error ?? 'unknown error'}
        </li>
      ))}
    </ul>
  </section>
);

export default FailuresPanel;
