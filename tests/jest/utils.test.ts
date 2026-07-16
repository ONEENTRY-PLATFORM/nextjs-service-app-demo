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

/**
 * First root item of a nested menu — the subject of most cases below.
 * @param   {IMenusPages[]}           flat - Menu pages in either API shape
 * @returns {IMenusPages | undefined}      First root item, if any
 */
const nestedFirst = (flat: IMenusPages[]): IMenusPages | undefined =>
  flatMenuToNested(flat, null)[0];

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

  it('drops the empty children array the API sends on every page', () => {
    const flat = [
      { id: 1, parentId: null, children: [] },
    ] as unknown as IMenusPages[];

    expect(nestedFirst(flat)).not.toHaveProperty('children');
  });

  it('keeps children the API already nested instead of deleting them', () => {
    // Guards the latent defect: children were rebuilt from `parentId` against
    // the FLAT list, so for a tree response the lookup found nothing and the
    // real submenu was `delete`d. Menus arrive flat today — only a test holds
    // this branch honest.
    const tree = [
      { id: 2, parentId: null, children: [{ id: 3, parentId: 2 }] },
    ] as unknown as IMenusPages[];

    const children = nestedFirst(tree)?.children as IMenusPages[] | undefined;

    expect(children).toHaveLength(1);
    expect(children?.[0]?.id).toBe(3);
  });

  it('accepts a single child object, not just an array', () => {
    const tree = [
      { id: 2, parentId: null, children: { id: 3, parentId: 2 } },
    ] as unknown as IMenusPages[];

    const children = nestedFirst(tree)?.children as IMenusPages[] | undefined;

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
