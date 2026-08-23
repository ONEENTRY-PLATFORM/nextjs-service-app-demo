import type { IMenusPages } from 'oneentry/types';

import { normalizeMenuPages } from '@/components/utils/normalizeMenuPages';

const page = (id: number): IMenusPages => ({ id }) as IMenusPages;

describe('normalizeMenuPages', () => {
  it('passes an array through', () => {
    const pages = [page(1), page(2)];
    expect(normalizeMenuPages(pages)).toEqual(pages);
  });

  it('wraps a single object instead of dropping it', () => {
    // The defect this guards: `Array.isArray(pages) ? pages : []` silently threw
    // the lone page away and rendered an empty menu. The API sends arrays today,
    // so only a test can hold this branch honest.
    expect(normalizeMenuPages(page(7))).toEqual([page(7)]);
  });

  it('returns an empty array for nothing at all', () => {
    expect(normalizeMenuPages(undefined)).toEqual([]);
    expect(normalizeMenuPages(null)).toEqual([]);
  });

  it('keeps an empty array empty', () => {
    expect(normalizeMenuPages([])).toEqual([]);
  });
});
