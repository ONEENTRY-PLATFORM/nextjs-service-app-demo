import {
  entityLinks,
  entityPageIds,
  entityProductIds,
} from '@/app/utils/entityLinks';

const SALON_LINKS = [
  { title: 'Thalia Downtown', value: { id: 39, depth: 2 } },
  { title: 'Thalia Marina', value: { id: 40, depth: 2 } },
];

const SERVICE_LINKS = [
  { title: 'Haircut', value: { id: 'p-12-233', parentId: 12 } },
  { title: 'Blow-dry', value: { id: 'p-13-240', parentId: 13 } },
];

describe('entityLinks', () => {
  it('decodes page links', () => {
    expect(entityLinks(SALON_LINKS)).toEqual([
      { title: 'Thalia Downtown', id: 39, parentId: undefined },
      { title: 'Thalia Marina', id: 40, parentId: undefined },
    ]);
  });

  it('keeps a product id as the composite string the CMS stores', () => {
    expect(entityLinks(SERVICE_LINKS)[0]).toEqual({
      title: 'Haircut',
      id: 'p-12-233',
      parentId: 12,
    });
  });

  /**
   * The defect this reader exists to close: an entity attribute with nothing
   * selected comes back as the empty STRING, and `''.map` throws.
   */
  it.each([
    ['the empty string the CMS sends for an unset attribute', ''],
    ['undefined', undefined],
    ['null', null],
    ['a number', 7],
    ['an object', { id: 1 }],
  ])('is empty for %s', (_label, value) => {
    expect(() => entityLinks(value)).not.toThrow();
    expect(entityLinks(value)).toEqual([]);
  });

  it('tolerates entries without a title or a value', () => {
    expect(entityLinks([{}, { value: {} }])).toEqual([
      { title: '', id: undefined, parentId: undefined },
      { title: '', id: undefined, parentId: undefined },
    ]);
  });
});

describe('entityPageIds', () => {
  it('keeps numeric page ids', () => {
    expect(entityPageIds(SALON_LINKS)).toEqual([39, 40]);
  });

  it('skips product links, whose id is not a page id', () => {
    expect(entityPageIds(SERVICE_LINKS)).toEqual([]);
  });

  it('is empty for an unset attribute', () => {
    expect(entityPageIds('')).toEqual([]);
  });
});

describe('entityProductIds', () => {
  it('pulls the product id out of the composite id', () => {
    expect(entityProductIds(SERVICE_LINKS)).toEqual([233, 240]);
  });

  it('skips page links', () => {
    expect(entityProductIds(SALON_LINKS)).toEqual([]);
  });

  it('skips a malformed composite id', () => {
    expect(entityProductIds([{ value: { id: 'p-12-' } }])).toEqual([]);
  });

  it('is empty for an unset attribute', () => {
    expect(entityProductIds('')).toEqual([]);
  });
});
