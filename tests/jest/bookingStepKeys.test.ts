import bookingStepKeys from '@/components/layout/booking-page/bookingStepKeys';
import { ANY_MASTER } from '@/components/layout/booking-page/constants';
import type {
  BookingMaster,
  BookingSalon,
} from '@/components/layout/booking-page/types';

/**
 * Minimal specialist stub — only the salon links steer the step order.
 * @param   {string}        id       - Specialist id
 * @param   {number[]}      salonIds - Page ids of the salons they work at
 * @returns {BookingMaster}          Specialist stub
 */
const master = (id: string, salonIds: number[]): BookingMaster =>
  ({ id, salonIds, serviceIds: [] }) as unknown as BookingMaster;

const SALONS = [
  { id: 39, name: 'Downtown' },
  { id: 40, name: 'Marina' },
  { id: 41, name: 'JBR' },
] as BookingSalon[];

const MASTERS = [master('m1', [39]), master('m2', [39, 40]), master('m3', [])];

/**
 * Call the step-order function with the defaults most cases share.
 * @param   {object}     over - Fields to override
 * @returns {string[]}        Step keys in order
 */
const keys = (over: Partial<Parameters<typeof bookingStepKeys>[0]> = {}) =>
  bookingStepKeys({
    flow: 'specialist-first',
    serviceLocked: false,
    master: '',
    masters: MASTERS,
    salons: SALONS,
    ...over,
  });

describe('bookingStepKeys — entry screen', () => {
  it('has no steps until a flow is chosen', () => {
    expect(keys({ flow: null })).toEqual([]);
  });
});

describe('bookingStepKeys — salon-first', () => {
  it('walks studio → service → specialist → date', () => {
    expect(keys({ flow: 'salon-first' })).toEqual([
      'salon',
      'service',
      'specialist',
      'datetime',
    ]);
  });

  it('drops the Service step when the service came preselected', () => {
    expect(keys({ flow: 'salon-first', serviceLocked: true })).toEqual([
      'salon',
      'specialist',
      'datetime',
    ]);
  });
});

describe('bookingStepKeys — specialist-first', () => {
  it('adds a Salon step for a specialist working at several studios', () => {
    expect(keys({ master: 'm2' })).toEqual([
      'specialist',
      'salon',
      'service',
      'datetime',
    ]);
  });

  it('skips the Salon step when the specialist has exactly one studio', () => {
    expect(keys({ master: 'm1' })).toEqual([
      'specialist',
      'service',
      'datetime',
    ]);
  });

  /**
   * An empty `salonIds` means "no restriction", so the client picks from every
   * studio — which is a choice and therefore needs the step.
   */
  it('adds the Salon step for a specialist with no salon links', () => {
    expect(keys({ master: 'm3' })).toEqual([
      'specialist',
      'salon',
      'service',
      'datetime',
    ]);
  });

  it('adds the Salon step for "Any specialist" — the studio is the choice', () => {
    expect(keys({ master: ANY_MASTER })).toEqual([
      'specialist',
      'salon',
      'service',
      'datetime',
    ]);
  });

  it('skips it for "Any specialist" when the studio is not a choice', () => {
    expect(keys({ master: ANY_MASTER, salons: [SALONS[0]!] })).toEqual([
      'specialist',
      'service',
      'datetime',
    ]);
  });

  it('treats an unknown specialist id as unrestricted', () => {
    expect(keys({ master: 'nope' })).toEqual([
      'specialist',
      'salon',
      'service',
      'datetime',
    ]);
  });

  /** `serviceLocked` is a salon-first concept and must not leak across flows. */
  it('keeps the Service step even when the service was preselected', () => {
    expect(keys({ master: 'm1', serviceLocked: true })).toContain('service');
  });
});
