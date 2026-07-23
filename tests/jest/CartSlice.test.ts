import type { UnknownAction } from '@reduxjs/toolkit';

import reducer, {
  addServiceToCart,
  removeAllServices,
  selectCartSelection,
  selectFilledCartCount,
  setCartVersion,
} from '@/app/store/reducers/CartSlice';

const init = (): ReturnType<typeof reducer> =>
  reducer(undefined, { type: '@@INIT' } as UnknownAction);

describe('CartSlice', () => {
  it('starts with nothing selected', () => {
    const state = init();
    expect(state.salonId).toBeUndefined();
    expect(state.productId).toBeUndefined();
    expect(state.masterId).toBeUndefined();
    expect(state.version).toBe(0);
  });

  describe('addServiceToCart', () => {
    it('merges only the provided fields', () => {
      let state = init();
      state = reducer(state, addServiceToCart({ salonId: 11 }));
      state = reducer(state, addServiceToCart({ masterId: 7 }));
      expect(state).toMatchObject({ salonId: 11, masterId: 7 });
      expect(state.productId).toBeUndefined();
    });

    it('clears a field when null is passed, leaving the others', () => {
      let state = reducer(
        init(),
        addServiceToCart({ salonId: 11, masterId: 7 }),
      );
      state = reducer(state, addServiceToCart({ masterId: null }));
      expect(state.salonId).toBe(11);
      expect(state.masterId).toBeUndefined();
    });

    it('overwrites a field with a new value', () => {
      let state = reducer(init(), addServiceToCart({ productId: 42 }));
      state = reducer(state, addServiceToCart({ productId: 99 }));
      expect(state.productId).toBe(99);
    });

    /** The clear-on-null contract producers rely on: a product pick drops any stale salon/master. */
    it('a product pick can clear a salon and master left from an earlier flow', () => {
      let state = reducer(
        init(),
        addServiceToCart({ salonId: 3, masterId: 8 }),
      );
      state = reducer(
        state,
        addServiceToCart({ productId: 42, salonId: null, masterId: null }),
      );
      expect(state).toMatchObject({ productId: 42 });
      expect(state.salonId).toBeUndefined();
      expect(state.masterId).toBeUndefined();
    });
  });

  it('removeAllServices clears the selection but keeps the version', () => {
    let state = reducer(init(), setCartVersion(2));
    state = reducer(state, addServiceToCart({ salonId: 11, productId: 42 }));
    state = reducer(state, removeAllServices());
    expect(state.salonId).toBeUndefined();
    expect(state.productId).toBeUndefined();
    expect(state.version).toBe(2);
  });

  it('setCartVersion stores the hydration marker', () => {
    expect(reducer(init(), setCartVersion(2)).version).toBe(2);
  });

  describe('selectCartSelection', () => {
    it('reads the three selection ids', () => {
      const state = reducer(
        init(),
        addServiceToCart({ salonId: 5, masterId: 9 }),
      );
      expect(selectCartSelection({ cartReducer: state })).toEqual({
        salonId: 5,
        productId: undefined,
        masterId: 9,
      });
    });
  });

  describe('selectFilledCartCount', () => {
    it('counts an untouched cart as 0', () => {
      expect(selectFilledCartCount({ cartReducer: init() })).toBe(0);
    });

    it('counts 1 once anything is picked', () => {
      const state = reducer(init(), addServiceToCart({ masterId: 7 }));
      expect(selectFilledCartCount({ cartReducer: state })).toBe(1);
    });

    it('drops back to 0 once the cart is cleared', () => {
      let state = reducer(init(), addServiceToCart({ productId: 233 }));
      state = reducer(state, removeAllServices());
      expect(selectFilledCartCount({ cartReducer: state })).toBe(0);
    });
  });
});
