import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';

import {
  flatMenuToNested,
  shuffleArray,
  sortArrayByPosition,
  sortObjectFieldsByPosition,
  UseDate,
  UsePrice,
} from '@/components/utils';

describe('UsePrice', () => {
  it('formats a number as USD', () => {
    expect(UsePrice({ amount: 99.99 })).toBe('$99.99');
  });

  it('accepts a numeric string', () => {
    expect(UsePrice({ amount: '150' })).toBe('$150.00');
  });
});

describe('UseDate', () => {
  it('formats a date as day-month-year', () => {
    expect(UseDate({ fullDate: '2026-01-01T12:00:00Z', format: 'en' })).toBe(
      '01-Jan-2026',
    );
  });
});

describe('sortArrayByPosition', () => {
  it('sorts items ascending by position', () => {
    const items = [{ position: 3 }, { position: 1 }, { position: 2 }];
    expect(sortArrayByPosition(items).map((i) => i.position)).toEqual([
      1, 2, 3,
    ]);
  });
});

describe('sortObjectFieldsByPosition', () => {
  it('orders object entries by position', () => {
    const sorted = sortObjectFieldsByPosition({
      a: { position: 2 },
      b: { position: 1 },
    });
    expect(Object.keys(sorted)).toEqual(['b', 'a']);
  });
});

describe('flatMenuToNested', () => {
  it('builds a tree from parentId references', () => {
    const flat = [
      { id: 1, parentId: null },
      { id: 2, parentId: null },
      { id: 3, parentId: 2 },
    ] as unknown as IMenusPages[];

    const nested = flatMenuToNested(flat, null);
    const children = nested[1]?.children as IMenusPages[] | undefined;

    expect(nested).toHaveLength(2);
    expect(children).toHaveLength(1);
    expect(children?.[0]?.id).toBe(3);
  });
});

describe('shuffleArray', () => {
  it('keeps the same elements and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    const shuffled = shuffleArray(input);

    expect(input).toEqual(copy);
    expect([...shuffled].sort()).toEqual([...input].sort());
  });
});
