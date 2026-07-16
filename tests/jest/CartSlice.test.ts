import type { UnknownAction } from '@reduxjs/toolkit';

import reducer, {
  addServiceToCart,
  removeAllServices,
  selectActiveItemId,
  selectCartData,
  selectFilledCartCount,
  selectTabDataIds,
  selectTabsState,
  setCartVersion,
  setTabDataIds,
  setTabsState,
} from '@/app/store/reducers/CartSlice';

const init = (): ReturnType<typeof reducer> =>
  reducer(undefined, { type: '@@INIT' } as UnknownAction);

describe('CartSlice', () => {
  it('has a single empty cart row and active salons tab initially', () => {
    const state = init();

    expect(state.servicesData).toEqual([{ id: 0 }]);
    expect(state.activeItemId).toBe(0);
    expect(state.tabsState.salons.isActive).toBe(true);
    expect(state.tabsState.services.isActive).toBe(false);
  });

  describe('addServiceToCart', () => {
    it('merges only the provided fields into the matching row', () => {
      let state = init();
      state = reducer(state, addServiceToCart({ id: 0, salonId: 11 }));
      state = reducer(state, addServiceToCart({ id: 0, masterId: 7 }));

      expect(state.servicesData[0]).toEqual({
        id: 0,
        salonId: 11,
        masterId: 7,
      });
    });

    it('clears a field when null is passed', () => {
      let state = init();
      state = reducer(
        state,
        addServiceToCart({ id: 0, salonId: 11, serviceId: 3 }),
      );
      state = reducer(state, addServiceToCart({ id: 0, serviceId: null }));

      expect(state.servicesData[0]).toEqual({ id: 0, salonId: 11 });
    });

    it('pushes a new row for an unknown id', () => {
      const state = reducer(init(), addServiceToCart({ id: 5, productId: 42 }));

      expect(state.servicesData).toHaveLength(2);
      expect(state.servicesData[1]).toEqual({ id: 5, productId: 42 });
    });
  });

  it('removeAllServices resets rows to the initial empty item', () => {
    let state = reducer(init(), addServiceToCart({ id: 0, salonId: 11 }));
    state = reducer(state, removeAllServices());

    expect(state.servicesData).toEqual([{ id: 0 }]);
  });

  it('setCartVersion stores the hydration marker', () => {
    expect(reducer(init(), setCartVersion(2)).version).toBe(2);
  });

  it('setTabsState toggles a tab and setTabDataIds stores filtered ids', () => {
    let state = reducer(init(), setTabsState({ key: 'masters', value: true }));
    state = reducer(state, setTabDataIds({ key: 'masters', value: [1, 2] }));

    expect(state.tabsState.masters.isActive).toBe(true);
    expect(state.tabsState.masters.dataIds).toEqual([1, 2]);
  });

  it('selectors read rows, active id and tab state', () => {
    const state = reducer(init(), setTabDataIds({ key: 'salons', value: [9] }));
    const root = { cartReducer: state };

    expect(selectCartData(root)).toBe(state.servicesData);
    expect(selectActiveItemId(root)).toBe(0);
    expect(selectTabsState('salons', root).dataIds).toEqual([9]);
    expect(selectTabDataIds('salons', root)).toEqual([9]);
  });

  describe('selectFilledCartCount', () => {
    it('counts an untouched cart as 0 even though a row exists', () => {
      const state = init();

      /** The seeded placeholder row must not light up the nav badge. */
      expect(state.servicesData).toHaveLength(1);
      expect(selectFilledCartCount({ cartReducer: state })).toBe(0);
    });

    it('counts the row once anything is picked, and stays 1 as the same row is merged into', () => {
      let state = reducer(init(), addServiceToCart({ id: 0, masterId: 7 }));
      expect(selectFilledCartCount({ cartReducer: state })).toBe(1);

      /** Merging more fields into the same row must not inflate the badge. */
      state = reducer(state, addServiceToCart({ id: 0, productId: 233 }));
      state = reducer(state, addServiceToCart({ id: 0, salonId: 39 }));
      expect(selectFilledCartCount({ cartReducer: state })).toBe(1);
    });

    it('drops back to 0 once the cart is cleared', () => {
      let state = reducer(init(), addServiceToCart({ id: 0, productId: 233 }));
      state = reducer(state, removeAllServices());

      expect(selectFilledCartCount({ cartReducer: state })).toBe(0);
    });
  });
});
