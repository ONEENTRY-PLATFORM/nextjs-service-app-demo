'use client';

import type { JSX } from 'react';

import type { RequestResult } from '../types';

const HIST_HEIGHT = 200;
const HIST_PAD_X = 36;
const HIST_PAD_Y = 16;
const HIST_BIN_COUNT = 16;

/**
 * Histogram — latency distribution over `HIST_BIN_COUNT` equal-width bins.
 *
 * Builds bins from `0..max(latency)`, fills them by sample count, then renders each
 * bin as a green rectangle. Bin index is shown on the x-axis as a latency range label
 * (start..end ms). Counts are shown on the y-axis.
 * @param   {object}          props         - Component props.
 * @param   {RequestResult[]} props.results - Successful + failed samples; only successful contribute to bins.
 * @returns {JSX.Element}                   JSX `<svg>` of the histogram.
 */
const Histogram = ({ results }: { results: RequestResult[] }): JSX.Element => {
  const times = results
    .filter((r) => r.success && Number.isFinite(r.time) && r.time >= 0)
    .map((r) => r.time);
  const max = times.length ? Math.max(...times) : 1;
  const bins = new Array<number>(HIST_BIN_COUNT).fill(0);
  for (const t of times) {
    const idx = Math.min(
      HIST_BIN_COUNT - 1,
      Math.floor((t / max) * HIST_BIN_COUNT),
    );
    bins[idx] = (bins[idx] ?? 0) + 1;
  }
  const yMax = Math.max(1, ...bins);
  const viewW = 1000;
  const innerW = viewW - HIST_PAD_X * 2;
  const innerH = HIST_HEIGHT - HIST_PAD_Y * 2;
  const binW = innerW / HIST_BIN_COUNT;

  return (
    <svg
      viewBox={`0 0 ${viewW} ${HIST_HEIGHT}`}
      preserveAspectRatio="none"
      className="block h-50 w-full"
      role="img"
      aria-label="Latency histogram"
    >
      {[0, 0.5, 1].map((g) => {
        const y = HIST_PAD_Y + innerH * (1 - g);
        return (
          <g key={g}>
            <line
              x1={HIST_PAD_X}
              x2={viewW - HIST_PAD_X / 2}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={HIST_PAD_X - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill="rgba(223,233,249,0.6)"
            >
              {(yMax * g).toFixed(0)}
            </text>
          </g>
        );
      })}
      {bins.map((count, i) => {
        const h = (count / yMax) * innerH;
        const x = HIST_PAD_X + i * binW + 2;
        const y = HIST_PAD_Y + innerH - h;
        const w = Math.max(1, binW - 4);
        const binStart = (i / HIST_BIN_COUNT) * max;
        const binEnd = ((i + 1) / HIST_BIN_COUNT) * max;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="#22c55e"
            opacity={0.85}
          >
            <title>{`${binStart.toFixed(0)}–${binEnd.toFixed(0)} ms — ${count} req`}</title>
          </rect>
        );
      })}
      <line
        x1={HIST_PAD_X}
        x2={viewW - HIST_PAD_X / 2}
        y1={HIST_HEIGHT - HIST_PAD_Y}
        y2={HIST_HEIGHT - HIST_PAD_Y}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
    </svg>
  );
};

export default Histogram;
