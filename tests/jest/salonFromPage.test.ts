import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { salonMapLinks } from '@/app/utils/salonMapLinks';
import { salonFromPage } from '@/components/utils/salonFromPage';

/**
 * Build a salon page stub with only the fields the decoder reads.
 * @param   {object}       attributeValues - Raw `attributeValues` map
 * @param   {object}       [extra]         - Top-level overrides
 * @param   {string}       [extra.title]   - `localizeInfos.title`
 * @param   {string}       [extra.pageUrl] - Page url (the `/salons/{handle}` segment)
 * @param   {number}       [extra.id]      - Page id
 * @returns {IPagesEntity}                 Salon page stub
 */
const page = (
  attributeValues: Record<string, { value: unknown }>,
  extra: { title?: string; pageUrl?: string; id?: number } = {},
): IPagesEntity =>
  ({
    id: extra.id ?? 39,
    pageUrl: extra.pageUrl ?? 'downtown',
    localizeInfos: { title: extra.title ?? 'Thalia Downtown' },
    attributeValues,
  }) as unknown as IPagesEntity;

const FULL = {
  salon_address: { value: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai' },
  salon_phone: { value: '+971 4 701 2200' },
};

describe('salonFromPage', () => {
  it('decodes the fields every consumer needs', () => {
    expect(salonFromPage(page(FULL))).toEqual({
      id: 39,
      url: 'downtown',
      name: 'Thalia Downtown',
      address: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
      phone: '+971 4 701 2200',
    });
  });

  it('keeps the id numeric, as the CMS stores it', () => {
    expect(salonFromPage(page(FULL, { id: 41 })).id).toBe(41);
  });

  it('hands the phone back unformatted', () => {
    expect(
      salonFromPage(page({ salon_phone: { value: '+97147012200' } })).phone,
    ).toBe('+97147012200');
  });

  it('degrades to empty strings when the attributes are missing', () => {
    expect(salonFromPage(page({}))).toMatchObject({ address: '', phone: '' });
  });

  /**
   * The defect this decoder exists to fix: two call sites wrote
   * `value as string ?? ''`, which only substitutes on null/undefined — a
   * non-string travelled on as a fake string and reached `encodeURIComponent`
   * and the `tel:` href.
   */
  it.each([
    ['an empty array', []],
    ['a number', 42],
    ['an object', { downloadLink: 'x' }],
    ['null', null],
  ])('ignores a non-string address (%s)', (_label, value) => {
    expect(salonFromPage(page({ salon_address: { value } })).address).toBe('');
  });

  it('ignores a non-string phone the same way', () => {
    expect(
      salonFromPage(page({ salon_phone: { value: 971_4_701 } })).phone,
    ).toBe('');
  });

  it('falls back to the pageUrl, never to an empty name', () => {
    expect(salonFromPage(page(FULL, { title: '' })).name).toBe('downtown');
  });

  it('reads nothing beyond the five fields it declares', () => {
    expect(Object.keys(salonFromPage(page(FULL))).sort()).toEqual([
      'address',
      'id',
      'name',
      'phone',
      'url',
    ]);
  });
});

describe('salonMapLinks', () => {
  it('builds the dial target from the raw phone', () => {
    expect(salonMapLinks(salonFromPage(page(FULL))).tel).toBe('+97147012200');
  });

  it('yields an empty dial target when no phone is stored', () => {
    const salon = { ...salonFromPage(page(FULL)), phone: '' };
    expect(salonMapLinks(salon).tel).toBe('');
  });

  it('encodes the address into both map URLs', () => {
    const links = salonMapLinks(salonFromPage(page(FULL)));
    expect(links.mapSrc).toContain('Sheikh%20Mohammed');
    expect(links.mapSrc).toContain('output=embed');
    expect(links.mapsLink).toContain('destination=Sheikh%20Mohammed');
  });

  it('falls back to the salon name when there is no address', () => {
    const links = salonMapLinks(salonFromPage(page({})));
    expect(links.mapSrc).toContain(encodeURIComponent('Thalia Downtown'));
  });
});
