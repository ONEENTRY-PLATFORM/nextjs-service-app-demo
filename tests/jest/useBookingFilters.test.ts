import { renderHook } from '@testing-library/react';

import { ANY_MASTER } from '@/components/layout/booking-page/constants';
import { useBookingFilters } from '@/components/layout/booking-page/hooks/useBookingFilters';
import type {
  BookingData,
  BookingMaster,
  BookingSalon,
  BookingService,
} from '@/components/layout/booking-page/types';

/**
 * Minimal service stub.
 * @param   {string}         id       - Product id as a string
 * @param   {string}         category - Display category pill
 * @returns {BookingService}          Service stub
 */
const service = (id: string, category: string): BookingService =>
  ({ id, category, name: `svc-${id}` }) as unknown as BookingService;

/**
 * Minimal specialist stub.
 * @param   {string}        id         - Specialist id
 * @param   {number[]}      salonIds   - Salons they work at (`[]` = unrestricted)
 * @param   {string[]}      serviceIds - Services they perform (`[]` = unrestricted)
 * @returns {BookingMaster}            Specialist stub
 */
const master = (
  id: string,
  salonIds: number[],
  serviceIds: string[],
): BookingMaster => ({ id, salonIds, serviceIds }) as unknown as BookingMaster;

const SALONS = [
  { id: 39, name: 'Downtown' },
  { id: 40, name: 'Marina' },
] as BookingSalon[];

const SERVICES = [
  service('s1', 'Hair'),
  service('s2', 'Face'),
  service('s3', 'Hair'),
];

const MASTERS = [
  master('m1', [39], ['s1']),
  master('m2', [40], ['s2']),
  master('m3', [], []),
];

const DATA: BookingData = {
  salons: SALONS,
  services: SERVICES,
  masters: MASTERS,
};

/**
 * Render the filters hook with the defaults most cases share.
 * @param   {object} over - Selection fields to override
 * @returns {object}      The hook's derived state
 */
const filters = (over: Partial<Parameters<typeof useBookingFilters>[0]> = {}) =>
  renderHook(() =>
    useBookingFilters({
      data: DATA,
      flow: 'salon-first',
      salon: null,
      serviceIds: [],
      master: '',
      categoryFilter: 'All',
      ...over,
    }),
  ).result.current;

const ids = (list: Array<{ id: string | number }>) => list.map((x) => x.id);

describe('useBookingFilters — category pills', () => {
  it('offers All plus only the categories the services cover, in canonical order', () => {
    expect(filters().categories).toEqual(['All', 'Hair', 'Face']);
  });

  it('appends categories outside the canonical order after it', () => {
    const data = { ...DATA, services: [...SERVICES, service('s4', 'Brows')] };
    expect(filters({ data }).categories).toEqual([
      'All',
      'Hair',
      'Face',
      'Brows',
    ]);
  });
});

describe('useBookingFilters — specialists', () => {
  it('narrows by salon in the salon-first flow', () => {
    expect(ids(filters({ salon: 39 }).filteredMasters)).toEqual(['m1', 'm3']);
  });

  /** The specialist picks the salon in this flow, so it must not pre-filter. */
  it('does NOT narrow by salon in the specialist-first flow', () => {
    expect(
      ids(filters({ flow: 'specialist-first', salon: 39 }).filteredMasters),
    ).toEqual(['m1', 'm2', 'm3']);
  });

  it('keeps specialists performing at least one of the picked services', () => {
    expect(ids(filters({ serviceIds: ['s1', 's2'] }).filteredMasters)).toEqual([
      'm1',
      'm2',
      'm3',
    ]);
    expect(ids(filters({ serviceIds: ['s2'] }).filteredMasters)).toEqual([
      'm2',
      'm3',
    ]);
  });

  it('narrows by the category pill', () => {
    expect(ids(filters({ categoryFilter: 'Face' }).filteredMasters)).toEqual([
      'm2',
      'm3',
    ]);
  });

  /** Empty CMS link arrays mean "no restriction" — m3 survives every filter. */
  it('never drops a specialist with no links at all', () => {
    const narrowed = filters({
      salon: 39,
      serviceIds: ['s2'],
      categoryFilter: 'Face',
    }).filteredMasters;
    expect(ids(narrowed)).toContain('m3');
  });
});

describe('useBookingFilters — salons', () => {
  it('offers every salon while no specialist is chosen', () => {
    expect(ids(filters().filteredSalons)).toEqual([39, 40]);
  });

  it('narrows to the chosen specialist studios', () => {
    expect(ids(filters({ master: 'm2' }).filteredSalons)).toEqual([40]);
  });

  it('offers every salon for "Any specialist"', () => {
    expect(ids(filters({ master: ANY_MASTER }).filteredSalons)).toEqual([
      39, 40,
    ]);
  });

  it('offers every salon for a specialist without salon links', () => {
    expect(ids(filters({ master: 'm3' }).filteredSalons)).toEqual([39, 40]);
  });
});

describe('useBookingFilters — services', () => {
  it('offers everything in the salon-first flow', () => {
    expect(ids(filters({ master: 'm1' }).filteredServices)).toEqual([
      's1',
      's2',
      's3',
    ]);
  });

  /**
   * A concrete specialist shows their WHOLE roster across categories — a
   * multi-pick may span categories, so `categoryFilter` must not narrow it.
   */
  it('offers the whole roster of a chosen specialist, ignoring the pill', () => {
    expect(
      ids(
        filters({
          flow: 'specialist-first',
          master: 'm1',
          categoryFilter: 'Face',
        }).filteredServices,
      ),
    ).toEqual(['s1']);
  });

  it('locks "Any specialist" to the category they were chosen through', () => {
    expect(
      ids(
        filters({
          flow: 'specialist-first',
          master: ANY_MASTER,
          categoryFilter: 'Hair',
        }).filteredServices,
      ),
    ).toEqual(['s1', 's3']);
  });

  it('offers everything for a specialist with no service links', () => {
    expect(
      ids(filters({ flow: 'specialist-first', master: 'm3' }).filteredServices),
    ).toEqual(['s1', 's2', 's3']);
  });
});
