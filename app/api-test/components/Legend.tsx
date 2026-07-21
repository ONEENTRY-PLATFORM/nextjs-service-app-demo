'use client';

import type { JSX } from 'react';

import { bucketColor, bucketLabel } from '../constants';
import type { Bucket } from '../types';

/**
 * Legend — color/label key for the latency buckets used by `BarChart`.
 * @returns {JSX.Element} JSX inline legend (color swatch + label per bucket).
 */
const Legend = (): JSX.Element => {
  const buckets: Bucket[] = [
    'fast',
    'ok',
    'medium',
    'slow',
    'verySlow',
    'failed',
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-paper/70">
      {buckets.map((b) => (
        <li key={b} className="flex items-center gap-2">
          <span
            className="inline-block size-3 rounded-sm"
            style={{ backgroundColor: bucketColor[b] }}
          />
          {bucketLabel[b]}
        </li>
      ))}
    </ul>
  );
};

export default Legend;
