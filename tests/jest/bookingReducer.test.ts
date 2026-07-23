import {
  type BookingState,
  initialBookingState,
  makeBookingReducer,
} from '@/components/layout/booking-page/bookingReducer';
import { ANY_MASTER } from '@/components/layout/booking-page/constants';
import type {
  BookingData,
  BookingMaster,
  BookingSalon,
  BookingService,
} from '@/components/layout/booking-page/types';

/* ── Fixtures: 3 salons, 3 services, 3 masters spanning the invalidations ── */
const salon = (id: number): BookingSalon => ({
  id,
  name: `Salon ${id}`,
  address: '',
  phone: '',
});
const service = (id: string, category: string): BookingService => ({
  id,
  category,
  name: id,
  duration: '',
  durationMinutes: 60,
  price: null,
  currency: '',
  productId: null,
  categoryId: null,
});
const master = (
  id: string,
  salonIds: number[],
  serviceIds: string[],
): BookingMaster => ({
  id,
  adminId: null,
  name: id,
  grade: '',
  photo: '',
  specialties: [],
  rating: 5,
  reviews: null,
  price: null,
  bio: '',
  salonIds,
  serviceIds,
});

const data: BookingData = {
  salons: [salon(1), salon(2), salon(3)],
  services: [service('sv1', 'Hair'), service('sv2', 'Hair'), service('sv3', 'Face')],
  masters: [
    master('m-multi', [1, 2], ['sv1', 'sv2']),
    master('m-single', [1], ['sv1']),
    master('m-all', [1, 2, 3], ['sv1']),
  ],
};

const reduce = makeBookingReducer(data);
/** Fold a sequence of actions from a starting state. */
const run = (
  from: BookingState,
  ...actions: Parameters<typeof reduce>[1][]
): BookingState => actions.reduce((s, a) => reduce(s, a), from);

describe('bookingReducer', () => {
  it('starts at the entry screen with nothing chosen', () => {
    expect(initialBookingState).toMatchObject({
      flow: null,
      stepIdx: 0,
      serviceIds: [],
      master: '',
      touched: false,
    });
  });

  describe('START_FLOW', () => {
    it('enters a flow and resets step/category/lock, marking touched', () => {
      const dirty: BookingState = {
        ...initialBookingState,
        stepIdx: 3,
        categoryFilter: 'Hair',
        serviceLocked: true,
      };
      const s = reduce(dirty, { type: 'START_FLOW', flow: 'salon-first' });
      expect(s).toMatchObject({
        flow: 'salon-first',
        stepIdx: 0,
        categoryFilter: 'All',
        serviceLocked: false,
        touched: true,
      });
    });
  });

  describe('SELECT_SALON', () => {
    const base = run(initialBookingState, {
      type: 'START_FLOW',
      flow: 'salon-first',
    });

    it('sets the salon and marks touched', () => {
      expect(reduce(base, { type: 'SELECT_SALON', id: 2 })).toMatchObject({
        salon: 2,
        touched: true,
      });
    });

    it('invalidates a chosen master who does not work at the new salon', () => {
      const withMaster = { ...base, master: 'm-single' }; // works only at salon 1
      expect(reduce(withMaster, { type: 'SELECT_SALON', id: 2 }).master).toBe('');
    });

    it('keeps a master who does work at the new salon', () => {
      const withMaster = { ...base, master: 'm-multi' }; // salons 1 & 2
      expect(reduce(withMaster, { type: 'SELECT_SALON', id: 2 }).master).toBe(
        'm-multi',
      );
    });

    it('never clears the "any specialist" sentinel', () => {
      const withAny = { ...base, master: ANY_MASTER };
      expect(reduce(withAny, { type: 'SELECT_SALON', id: 3 }).master).toBe(
        ANY_MASTER,
      );
    });
  });

  describe('SELECT_SERVICE', () => {
    const base = run(initialBookingState, {
      type: 'START_FLOW',
      flow: 'salon-first',
    });

    it('toggles a service in and back out', () => {
      const added = reduce(base, { type: 'SELECT_SERVICE', id: 'sv1' });
      expect(added.serviceIds).toEqual(['sv1']);
      expect(reduce(added, { type: 'SELECT_SERVICE', id: 'sv1' }).serviceIds).toEqual(
        [],
      );
    });

    it('syncs the category to the single shared one, else All', () => {
      const one = reduce(base, { type: 'SELECT_SERVICE', id: 'sv1' });
      expect(one.categoryFilter).toBe('Hair');
      const mixed = reduce(one, { type: 'SELECT_SERVICE', id: 'sv3' }); // Hair + Face
      expect(mixed.categoryFilter).toBe('All');
    });

    it('invalidates a master who performs none of the remaining picks', () => {
      const withMaster = { ...base, master: 'm-single' }; // performs sv1 only
      const s = reduce(withMaster, { type: 'SELECT_SERVICE', id: 'sv3' });
      expect(s.master).toBe('');
    });

    it('keeps a master who performs at least one pick', () => {
      const withMaster = { ...base, master: 'm-multi' }; // sv1, sv2
      const s = reduce(withMaster, { type: 'SELECT_SERVICE', id: 'sv1' });
      expect(s.master).toBe('m-multi');
    });
  });

  describe('CLEAR_SERVICE', () => {
    it('clears services, unlocks the step and resets the category', () => {
      const s: BookingState = {
        ...initialBookingState,
        flow: 'salon-first',
        serviceIds: ['sv1', 'sv2'],
        serviceLocked: true,
        categoryFilter: 'Hair',
      };
      expect(reduce(s, { type: 'CLEAR_SERVICE' })).toMatchObject({
        serviceIds: [],
        serviceLocked: false,
        categoryFilter: 'All',
        touched: true,
      });
    });
  });

  describe('SELECT_MASTER', () => {
    const base = run(initialBookingState, {
      type: 'START_FLOW',
      flow: 'specialist-first',
    });

    it('auto-picks the studio of a single-salon specialist', () => {
      expect(reduce(base, { type: 'SELECT_MASTER', id: 'm-single' }).salon).toBe(1);
    });

    it('clears a chosen studio the specialist cannot cover', () => {
      const withSalon = { ...base, salon: 3 }; // m-multi works at 1 & 2
      expect(reduce(withSalon, { type: 'SELECT_MASTER', id: 'm-multi' }).salon).toBe(
        null,
      );
    });

    it('keeps a chosen studio the specialist covers', () => {
      const withSalon = { ...base, salon: 2 };
      expect(reduce(withSalon, { type: 'SELECT_MASTER', id: 'm-multi' }).salon).toBe(
        2,
      );
    });

    it('does not touch the studio for "any specialist"', () => {
      const withSalon = { ...base, salon: 3 };
      expect(reduce(withSalon, { type: 'SELECT_MASTER', id: ANY_MASTER }).salon).toBe(
        3,
      );
    });
  });

  describe('step navigation', () => {
    // salon-first, unlocked → ['salon','service','specialist','datetime'] (4)
    const started = run(initialBookingState, {
      type: 'START_FLOW',
      flow: 'salon-first',
    });

    it('NEXT advances but stops on the last step', () => {
      let s = started;
      for (let i = 0; i < 10; i++) s = reduce(s, { type: 'NEXT' });
      expect(s.stepIdx).toBe(3); // clamped at the last of four steps
    });

    it('BACK steps back, then exits the flow from step 0', () => {
      const atTwo = run(started, { type: 'NEXT' }, { type: 'NEXT' });
      const back = reduce(atTwo, { type: 'BACK' });
      expect(back.stepIdx).toBe(1);
      const atZero = run(back, { type: 'BACK' });
      expect(atZero.stepIdx).toBe(0);
      expect(reduce(atZero, { type: 'BACK' }).flow).toBe(null);
    });

    it('GO_STEP jumps to an index', () => {
      expect(reduce(started, { type: 'GO_STEP', idx: 2 }).stepIdx).toBe(2);
    });

    it('clamps stepIdx into range when the step list shrinks', () => {
      // specialist-first + multi-salon master → 4 steps; sit on the last one
      const multi = run(
        initialBookingState,
        { type: 'START_FLOW', flow: 'specialist-first' },
        { type: 'SELECT_MASTER', id: 'm-multi' },
        { type: 'GO_STEP', idx: 3 },
      );
      expect(multi.stepIdx).toBe(3);
      // switch to a single-salon master → 3 steps → cursor clamps to 2
      const single = reduce(multi, { type: 'SELECT_MASTER', id: 'm-single' });
      expect(single.stepIdx).toBe(2);
    });
  });

  describe('date / time', () => {
    it('SET_DATE drops the time (a new day has its own slots)', () => {
      const s: BookingState = { ...initialBookingState, time: '10:00' };
      const out = reduce(s, { type: 'SET_DATE', date: '2026-6-1' });
      expect(out).toMatchObject({ date: '2026-6-1', time: '', touched: true });
    });

    it('SET_DATE_TODAY sets the date WITHOUT marking touched', () => {
      const out = reduce(initialBookingState, {
        type: 'SET_DATE_TODAY',
        date: '2026-6-1',
      });
      expect(out.date).toBe('2026-6-1');
      expect(out.touched).toBe(false);
    });

    it('DROP_TIME clears the time WITHOUT marking touched', () => {
      const s: BookingState = { ...initialBookingState, time: '19:00' };
      const out = reduce(s, { type: 'DROP_TIME' });
      expect(out.time).toBe('');
      expect(out.touched).toBe(false);
    });
  });

  describe('PRESELECT', () => {
    it('lands on the last step of the resolved flow for "last"', () => {
      // specialist-first + single-salon master → ['specialist','service','datetime']
      const s = reduce(initialBookingState, {
        type: 'PRESELECT',
        preset: {
          patch: {
            flow: 'specialist-first',
            master: 'm-single',
            serviceIds: ['sv1'],
            salon: 1,
            categoryFilter: 'Hair',
          },
          stepIdx: 'last',
        },
      });
      expect(s.stepIdx).toBe(2); // datetime, the 3rd of three steps
      expect(s).toMatchObject({ flow: 'specialist-first', master: 'm-single' });
    });

    it('honours a numeric target step', () => {
      const s = reduce(initialBookingState, {
        type: 'PRESELECT',
        preset: {
          patch: { flow: 'specialist-first', master: 'm-multi' },
          stepIdx: 1,
        },
      });
      expect(s.stepIdx).toBe(1);
    });

    it('only patches the given fields, keeping the rest', () => {
      const seeded: BookingState = { ...initialBookingState, salon: 2 };
      const s = reduce(seeded, {
        type: 'PRESELECT',
        preset: {
          patch: { flow: 'specialist-first', master: 'm-multi' },
          stepIdx: 1,
        },
      });
      expect(s.salon).toBe(2); // untouched by the patch
    });

    it('does NOT mark touched (a preselect is not a user interaction)', () => {
      const s = reduce(initialBookingState, {
        type: 'PRESELECT',
        preset: {
          patch: {
            flow: 'salon-first',
            serviceIds: ['sv1'],
            categoryFilter: 'Hair',
            serviceLocked: true,
          },
          stepIdx: 0,
        },
      });
      expect(s.touched).toBe(false);
      expect(s.serviceLocked).toBe(true);
    });
  });

  describe('RESET', () => {
    it('returns to the entry screen but records the interaction', () => {
      const dirty = run(
        initialBookingState,
        { type: 'START_FLOW', flow: 'salon-first' },
        { type: 'SELECT_SALON', id: 2 },
        { type: 'SELECT_SERVICE', id: 'sv1' },
      );
      const s = reduce(dirty, { type: 'RESET' });
      expect(s).toEqual({ ...initialBookingState, touched: true });
    });
  });
});
