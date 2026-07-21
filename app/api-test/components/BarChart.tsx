'use client';

import type { JSX } from 'react';

import { bucketFor } from '../bucketFor';
import { bucketColor } from '../constants';
import { formatMs } from '../formatMs';
import type { Bucket, RequestResult } from '../types';

const CHART_HEIGHT = 220;
const CHART_PAD_X = 36;
const CHART_PAD_Y = 16;

/**
 * BarChart — request-order latency bars (one rect per sample).
 *
 * Computes the y-scale once from the max finite latency in `results`, then renders a
 * rect per sample. Bars are colored by `bucketFor()` so visual outliers and failures
 * stand out without a separate axis label. Y-axis shows the scale max + grid labels.
 * @param   {object}          props         - Component props.
 * @param   {RequestResult[]} props.results - Per-request samples (already in chronological order).
 * @returns {JSX.Element}                   JSX `<svg>` of the bar chart.
 */
const BarChart = ({ results }: { results: RequestResult[] }): JSX.Element => {
  const finite = results.filter(
    (r) => r.success && Number.isFinite(r.time) && r.time >= 0,
  );
  const yMax = finite.length ? Math.max(...finite.map((r) => r.time)) : 100;
  const yScale = yMax > 0 ? yMax : 1;
  const innerH = CHART_HEIGHT - CHART_PAD_Y * 2;
  const barCount = Math.max(results.length, 1);
  const viewW = 1000;
  const innerW = viewW - CHART_PAD_X * 2;
  const barW = innerW / barCount;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${viewW} ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      className="block h-55 w-full"
      role="img"
      aria-label="Per-request latency bar chart"
    >
      {gridLines.map((g) => {
        const y = CHART_PAD_Y + innerH * (1 - g);
        const v = yScale * g;
        return (
          <g key={g}>
            <line
              x1={CHART_PAD_X}
              x2={viewW - CHART_PAD_X / 2}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={CHART_PAD_X - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill="rgba(223,233,249,0.6)"
            >
              {v.toFixed(0)}
            </text>
          </g>
        );
      })}
      {results.map((r, i) => {
        const bucket: Bucket = bucketFor(r.time, r.success);
        const h =
          r.success && r.time > 0 ? Math.max(2, (r.time / yScale) * innerH) : 6;
        const x = CHART_PAD_X + i * barW + Math.min(2, barW * 0.1);
        const y = CHART_PAD_Y + innerH - h;
        const w = Math.max(1, barW - Math.min(2, barW * 0.1) * 2);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={bucketColor[bucket]}
            opacity={r.success ? 0.9 : 0.5}
          >
            <title>
              {`#${r.index + 1} — ${r.success ? formatMs(r.time) : `failed: ${r.error ?? 'unknown'}`}`}
            </title>
          </rect>
        );
      })}
      <line
        x1={CHART_PAD_X}
        x2={viewW - CHART_PAD_X / 2}
        y1={CHART_HEIGHT - CHART_PAD_Y}
        y2={CHART_HEIGHT - CHART_PAD_Y}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
    </svg>
  );
};

export default BarChart;
