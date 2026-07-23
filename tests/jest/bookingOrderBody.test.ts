import type {
  BookingMaster,
  BookingSalon,
  BookingService,
} from '@/components/layout/booking-page/types';
import { buildOrderFormData } from '@/components/layout/booking-page/utils/buildOrderFormData';
import { buildOrderProducts } from '@/components/layout/booking-page/utils/buildOrderProducts';
import { toBookingInterval } from '@/components/layout/booking-page/utils/toBookingInterval';

/**
 * service — a minimal bookable service for the tests.
 * @param   {Partial<BookingService>} over - Fields to override
 * @returns {BookingService}               Booking service
 */
const service = (over: Partial<BookingService> = {}): BookingService =>
  ({
    id: 'sv1',
    category: 'Hair',
    name: 'Haircut',
    duration: '60 min',
    durationMinutes: 60,
    price: 370,
    currency: 'AED',
    productId: 101,
    categoryId: 11,
    ...over,
  }) as BookingService;

const SALON = { id: 39, name: 'Downtown' } as BookingSalon;
const MASTER = { id: 'm1', adminId: 7, name: 'Sofia' } as BookingMaster;

describe('toBookingInterval', () => {
  it('builds the interval in UTC, not the local timezone', () => {
    const [start] = toBookingInterval({
      date: '2026-6-21',
      time: '14:00',
      services: [service()],
    });

    expect(start.toISOString()).toBe('2026-07-21T14:00:00.000Z');
  });

  it('spans the summed duration of every chosen service', () => {
    const [start, end] = toBookingInterval({
      date: '2026-6-21',
      time: '10:00',
      services: [
        service({ duration: '90 min', durationMinutes: 90 }),
        service({ duration: '30 min', durationMinutes: 30 }),
      ],
    });

    expect((end.getTime() - start.getTime()) / 60_000).toBe(120);
  });

  it('falls back to a 60-minute visit for an empty selection', () => {
    const [start, end] = toBookingInterval({
      date: '2026-6-21',
      time: '10:00',
      services: [],
    });

    expect((end.getTime() - start.getTime()) / 60_000).toBe(60);
  });
});

describe('buildOrderProducts', () => {
  it('keeps only services backed by a CMS product', () => {
    expect(
      buildOrderProducts([
        service({ productId: 101 }),
        service({ productId: null }),
        service({ productId: 102 }),
      ]),
    ).toEqual([
      { productId: 101, quantity: 1 },
      { productId: 102, quantity: 1 },
    ]);
  });

  it('yields nothing for an all-demo selection', () => {
    expect(buildOrderProducts([service({ productId: null })])).toEqual([]);
  });
});

describe('buildOrderFormData', () => {
  const interval: [Date, Date] = [
    new Date('2026-07-21T14:00:00.000Z'),
    new Date('2026-07-21T15:00:00.000Z'),
  ];

  it('sends exactly the three markers the order form accepts', () => {
    const formData = buildOrderFormData({
      salon: SALON,
      master: MASTER,
      interval,
    });

    expect(formData.map((f) => f.marker)).toEqual([
      'master',
      'salon',
      'interval',
    ]);
  });

  it('never sends price or currency (the form rejects them)', () => {
    const markers = buildOrderFormData({
      salon: SALON,
      master: MASTER,
      interval,
    }).map((f) => f.marker);

    expect(markers).not.toContain('price');
    expect(markers).not.toContain('currency');
  });

  it('sends the salon as a NUMERIC entity reference', () => {
    const salonField = buildOrderFormData({
      salon: SALON,
      master: MASTER,
      interval,
    }).find((f) => f.marker === 'salon');

    expect(salonField).toEqual({
      marker: 'salon',
      type: 'entity',
      value: [39],
    });
  });

  it('sends the master as a list of string ids', () => {
    const masterField = buildOrderFormData({
      salon: SALON,
      master: MASTER,
      interval,
    }).find((f) => f.marker === 'master');

    expect(masterField).toEqual({
      marker: 'master',
      type: 'list',
      value: ['7'],
    });
  });

  it('sends the interval as ISO strings', () => {
    const intervalField = buildOrderFormData({
      salon: SALON,
      master: MASTER,
      interval,
    }).find((f) => f.marker === 'interval');

    expect(intervalField?.value).toEqual([
      ['2026-07-21T14:00:00.000Z', '2026-07-21T15:00:00.000Z'],
    ]);
  });

  it('omits the master for "Any specialist"', () => {
    const formData = buildOrderFormData({ salon: SALON, interval });

    expect(formData.map((f) => f.marker)).toEqual(['salon', 'interval']);
  });

  /**
   * Replaces "omits a demo salon whose id is not numeric": the salon used to
   * travel as a string and be converted back here, so a non-numeric id had to
   * be screened out. `BookingSalon.id` is a number now, so that case is gone
   * from the type — the reachable one is simply having picked no salon. The
   * numeric shape of the entity ref stays pinned by the test above.
   */
  it('omits the salon when none is picked', () => {
    const formData = buildOrderFormData({ master: MASTER, interval });

    expect(formData.map((f) => f.marker)).toEqual(['master', 'interval']);
  });
});
