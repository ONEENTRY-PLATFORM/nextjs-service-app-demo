import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';

import type { OneEntryImageFile } from '@/components/utils';
import {
  fileBlurDataUrl,
  fileDisplayUrl,
  flatMenuToNested,
  formatUaePhone,
  getFormAttributes,
  getGalleryImageUrls,
  plainTextFromTextAttr,
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

describe('formatUaePhone', () => {
  it('groups an 8-digit landline as +971 A BBB CCCC', () => {
    // `971` country code is stripped, leaving 8 national digits
    expect(formatUaePhone('+97147012200')).toBe('+971 4 701 2200');
  });

  it('groups a 9-digit 5-prefixed mobile as +971 5X XXX XXXX', () => {
    expect(formatUaePhone('+971501234567')).toBe('+971 50 123 4567');
  });

  it('drops a local leading zero before regrouping', () => {
    // `047012200` → strip the local `0` → 8 national digits → landline shape
    expect(formatUaePhone('047012200')).toBe('+971 4 701 2200');
  });

  it('returns an unrecognized shape trimmed and unchanged', () => {
    // 5 national digits match neither the landline nor the mobile pattern
    expect(formatUaePhone('  12345  ')).toBe('12345');
  });

  it('returns an empty string for empty, null or undefined input', () => {
    expect(formatUaePhone('')).toBe('');
    expect(formatUaePhone(null)).toBe('');
    expect(formatUaePhone(undefined)).toBe('');
  });
});

describe('getFormAttributes', () => {
  it('returns a shallow copy of an array of fields (never the original)', () => {
    const attributes = [{ marker: 'name' }, { marker: 'phone' }];
    const result = getFormAttributes<{ marker: string }>({ attributes });

    expect(result).toEqual(attributes);
    expect(result).not.toBe(attributes);
  });

  it('takes the values of an object-shaped attributes map', () => {
    // The Forms API returns a populated map once fields exist
    const result = getFormAttributes<{ marker: string }>({
      attributes: {
        name: { marker: 'name' },
        phone: { marker: 'phone' },
      },
    });

    expect(result).toEqual([{ marker: 'name' }, { marker: 'phone' }]);
  });

  it('yields an empty array for an empty {} (a field-less form)', () => {
    expect(getFormAttributes({ attributes: {} })).toEqual([]);
  });

  it('yields an empty array for a missing form or missing attributes', () => {
    expect(getFormAttributes(undefined)).toEqual([]);
    expect(getFormAttributes({})).toEqual([]);
    expect(getFormAttributes({ attributes: null })).toEqual([]);
  });
});

describe('plainTextFromTextAttr', () => {
  it('returns a legacy plain string unchanged', () => {
    expect(plainTextFromTextAttr('Just text')).toBe('Just text');
  });

  it('prefers a non-empty plainValue over the html', () => {
    expect(
      plainTextFromTextAttr([
        { plainValue: 'Clean text', htmlValue: '<p>ignored</p>' },
      ]),
    ).toBe('Clean text');
  });

  it('strips tags and decodes entities when plainValue is empty', () => {
    expect(
      plainTextFromTextAttr([
        { plainValue: '', htmlValue: '<p>Hair &amp; Beauty</p>' },
      ]),
    ).toBe('Hair & Beauty');
  });

  it('collapses whitespace left by removed markup', () => {
    expect(
      plainTextFromTextAttr([
        { htmlValue: '<ul>\n  <li>One</li>\n  <li>Two</li>\n</ul>' },
      ]),
    ).toBe('One Two');
  });

  it('returns an empty string for empty, non-array or contentless values', () => {
    expect(plainTextFromTextAttr([])).toBe('');
    expect(plainTextFromTextAttr(undefined)).toBe('');
    expect(plainTextFromTextAttr(null)).toBe('');
    expect(plainTextFromTextAttr([{ plainValue: '', htmlValue: '' }])).toBe('');
  });
});

describe('fileDisplayUrl', () => {
  it('prefers the downloadLink string', () => {
    expect(fileDisplayUrl([{ downloadLink: 'https://cdn/a.jpg' }])).toBe(
      'https://cdn/a.jpg',
    );
  });

  it('reads default[1] then default[0] from an object-shaped link', () => {
    expect(
      fileDisplayUrl([{ downloadLink: { default: ['lqip', 'full'] } }]),
    ).toBe('full');
    expect(fileDisplayUrl([{ downloadLink: { default: ['only'] } }])).toBe(
      'only',
    );
  });

  it('falls back to previewLink when downloadLink is absent', () => {
    expect(fileDisplayUrl([{ previewLink: 'https://cdn/preview.jpg' }])).toBe(
      'https://cdn/preview.jpg',
    );
  });

  it('returns an empty string for empty, non-array or linkless values', () => {
    expect(fileDisplayUrl([])).toBe('');
    expect(fileDisplayUrl(undefined)).toBe('');
    expect(fileDisplayUrl([{}])).toBe('');
  });
});

describe('getGalleryImageUrls / fileBlurDataUrl', () => {
  /** Newer uploads: previewLink is an object `{ [key]: [blurDataUri, lqipUrl] }`. */
  const withObjectPreview: OneEntryImageFile = {
    downloadLink: 'https://cdn/full.jpg',
    defaultPreview: 'default',
    previewLink: { default: ['data:image/webp;base64,BLUR', 'https://cdn/lqip'] },
  };

  it('uses downloadLink for full/thumb and previewLink pair[0] for blur', () => {
    expect(getGalleryImageUrls(withObjectPreview)).toEqual({
      full: 'https://cdn/full.jpg',
      thumb: 'https://cdn/full.jpg',
      blur: 'data:image/webp;base64,BLUR',
    });
  });

  it('returns a null blur for a legacy string previewLink', () => {
    expect(
      getGalleryImageUrls({
        downloadLink: 'https://cdn/full.jpg',
        previewLink: 'https://cdn/preview.jpg',
      }),
    ).toEqual({
      full: 'https://cdn/full.jpg',
      thumb: 'https://cdn/full.jpg',
      blur: null,
    });
  });

  it('fileBlurDataUrl reads the ready-made blur data URI from the first file', () => {
    expect(fileBlurDataUrl([withObjectPreview])).toBe(
      'data:image/webp;base64,BLUR',
    );
  });

  it('fileBlurDataUrl returns undefined when there is no preview or no file', () => {
    expect(
      fileBlurDataUrl([{ downloadLink: 'https://cdn/full.jpg' }]),
    ).toBeUndefined();
    expect(fileBlurDataUrl([])).toBeUndefined();
    expect(fileBlurDataUrl(undefined)).toBeUndefined();
  });
});
