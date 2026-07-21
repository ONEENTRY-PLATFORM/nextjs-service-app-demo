'use client';

import type { JSX } from 'react';

import { bucketFor } from '../bucketFor';
import { bucketColor, bucketLabel } from '../constants';
import { formatBytes } from '../formatBytes';
import { formatMs } from '../formatMs';
import type { RequestResult } from '../types';

/**
 * ResultsTableRow — one sample of the per-request details table: status, its
 * latency bucket swatch, the client / server / network split, payload size,
 * start time and the error message when the probe failed.
 *
 * Network is derived rather than measured — `client − server` approximates
 * DNS/TCP/TLS/RTT plus the browser's fetch and JSON decode, and is only shown
 * when the route actually reported its own time.
 * @param   {object}        props        - Component props.
 * @param   {RequestResult} props.result - The sample to render.
 * @returns {JSX.Element}                JSX `<tr>` of the sample.
 */
const ResultsTableRow = ({
  result,
}: {
  result: RequestResult;
}): JSX.Element => {
  const bucket = bucketFor(result.time, result.success);
  const network =
    result.success && typeof result.serverTime === 'number'
      ? result.time - result.serverTime
      : null;

  return (
    <tr className="border-t border-paper/5 hover:bg-paper/5">
      <td className="px-2 py-1 text-right text-paper/50">{result.index + 1}</td>
      <td className="px-2 py-1">
        {result.success ? (
          <span className="text-emerald-300">OK</span>
        ) : (
          <span className="text-red-300">FAIL</span>
        )}
      </td>
      <td className="px-2 py-1">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-sm"
            style={{ backgroundColor: bucketColor[bucket] }}
          />
          <span className="text-paper/70">{bucketLabel[bucket]}</span>
        </span>
      </td>
      <td className="px-2 py-1 text-right">
        {result.success ? formatMs(result.time) : '—'}
      </td>
      <td className="px-2 py-1 text-right text-paper/70">
        {typeof result.serverTime === 'number'
          ? formatMs(result.serverTime)
          : '—'}
      </td>
      <td className="px-2 py-1 text-right text-paper/60">
        {network !== null ? formatMs(network) : '—'}
      </td>
      <td className="px-2 py-1 text-right text-paper/60">
        {typeof result.size === 'number' ? formatBytes(result.size) : '—'}
      </td>
      <td className="px-2 py-1 text-paper/60">
        {new Date(result.startedAt).toLocaleTimeString()}
      </td>
      <td
        className="max-w-80 truncate px-2 py-1 text-red-300"
        title={result.error ?? ''}
      >
        {result.error ?? ''}
      </td>
    </tr>
  );
};

export default ResultsTableRow;
