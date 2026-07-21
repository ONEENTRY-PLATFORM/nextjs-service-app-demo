import { MENUS, PAGES } from '@/app/utils/constants';

import type { Bucket, Preset } from './types';

/** The endpoint families the dashboard can probe, with their default markers. */
export const PRESET_OPTIONS: ReadonlyArray<{
  value: Preset;
  label: string;
  defaultMarker: string;
  hint: string;
}> = [
  {
    value: 'page',
    label: 'Page',
    defaultMarker: PAGES.home,
    hint: 'Pages.getPageByUrl',
  },
  {
    value: 'menu',
    label: 'Menu',
    defaultMarker: MENUS.main,
    hint: 'Menus.getMenusByMarker',
  },
  {
    value: 'block',
    label: 'Block',
    defaultMarker: '',
    hint: 'Blocks.getBlockByMarker (marker required)',
  },
  {
    value: 'products',
    label: 'Products',
    defaultMarker: '',
    hint: 'Products.getProducts ([], lang, {0,12})',
  },
];

/** Run sizes offered by the Requests picker. */
export const COUNT_OPTIONS = [5, 10, 20, 50, 100, 200] as const;

/** Fill color for each latency bucket. */
export const bucketColor: Record<Bucket, string> = {
  fast: '#22c55e',
  ok: '#84cc16',
  medium: '#eab308',
  slow: '#f59e0b',
  verySlow: '#ef4444',
  failed: '#6b7280',
};

/** Human-readable label for each latency band, used in the legend. */
export const bucketLabel: Record<Bucket, string> = {
  fast: '< 50 ms',
  ok: '50–200 ms',
  medium: '200–500 ms',
  slow: '500–1000 ms',
  verySlow: '> 1000 ms',
  failed: 'failed',
};
