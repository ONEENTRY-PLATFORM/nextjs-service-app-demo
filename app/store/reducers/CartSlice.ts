'use client';

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Cart item — holds only IDs of OneEntry entities, not the entities themselves.
 *
 * Entities are re-hydrated at read sites via RTK Query hooks (see `useCartItem`).
 * This keeps the Redux state small enough that `ImmutableStateInvariantMiddleware`
 * and redux-persist don't choke on deep clones of entire CMS payloads.
 */
export interface CartItem {
  id: number;
  salonId?: number;
  serviceId?: number;
  productId?: number;
  masterId?: number;
  date?: Date;
  interval?: Date[];
}

interface TabState {
  isActive: boolean;
  disabled: boolean;
  /**
   * IDs of the entities currently filtered into this tab.
   * Null when the tab has not computed its filter yet.
   */
  dataIds: number[] | null;
}

interface TabsState {
  salons: TabState;
  services: TabState;
  products: TabState;
  masters: TabState;
  calendar: TabState;
  signin: TabState;
  payment: TabState;
}

interface CartState {
  /** Row index into `servicesData`. Currently always 0 — multi-row booking is vestigial. */
  activeItemId: number;
  servicesData: CartItem[];
  tabsState: TabsState;
  transitionId: number;
  version: number;
}

const emptyTab: TabState = {
  isActive: false,
  disabled: false,
  dataIds: null,
};

/**
 * Initial state for the cart reducer.
 */
const initialState: CartState = {
  activeItemId: 0,
  servicesData: [{ id: 0 }],
  tabsState: {
    salons: { ...emptyTab, isActive: true },
    services: { ...emptyTab },
    products: { ...emptyTab },
    masters: { ...emptyTab },
    calendar: { ...emptyTab },
    signin: { ...emptyTab },
    payment: { ...emptyTab },
  },
  transitionId: 0,
  version: 0,
};

/**
 * Redux slice for managing the cart state.
 *
 * This slice stores only normalized IDs for salons, services, products and masters.
 * Entity data is looked up from the RTK Query cache via `useCartItem` at read sites.
 * @name cartSlice
 */
export const cartSlice = createSlice({
  name: 'cart-slice',
  initialState,
  reducers: {
    /**
     * Add/merge a cart item by id. Only the provided fields are overwritten.
     *
     * Pass `null` for a field to explicitly clear it (used when selecting a new
     * salon invalidates the previously picked service/master/product).
     * @param {CartState}             state  - Current state of the slice.
     * @param {PayloadAction<object>} action - Payload merged into the matching cart item.
     */
    addServiceToCart(
      state: CartState,
      action: PayloadAction<{
        id: number;
        salonId?: number | null;
        serviceId?: number | null;
        productId?: number | null;
        masterId?: number | null;
        date?: Date | null;
        interval?: Date[] | null;
      }>,
    ) {
      const payload = action.payload;
      const idx = state.servicesData.findIndex(
        (item) => item.id === payload.id,
      );

      const applyPatch = (target: CartItem) => {
        const bag = target as unknown as Record<string, unknown>;
        (Object.keys(payload) as (keyof typeof payload)[]).forEach((key) => {
          if (key === 'id') {
            return;
          }
          const value = payload[key];
          if (value === null) {
            delete bag[key];
          } else if (value !== undefined) {
            bag[key] = value;
          }
        });
      };

      if (idx === -1) {
        const fresh: CartItem = { id: payload.id };
        applyPatch(fresh);
        state.servicesData.push(fresh);
      } else {
        const existing = state.servicesData[idx];
        if (existing) {
          applyPatch(existing);
        }
      }
    },
    /**
     * Reset `servicesData` to its initial empty item.
     * @param {CartState} state - Current state of the slice.
     */
    removeAllServices(state: CartState) {
      state.servicesData = [{ id: 0 }];
    },
    /**
     * Set the cart version marker (used by AuthContext to detect hydration).
     * @param {CartState}             state  - Current state of the slice.
     * @param {PayloadAction<number>} action - New version number.
     */
    setCartVersion(state: CartState, action: PayloadAction<number>) {
      state.version = action.payload;
    },
    /**
     * Toggle a tab's active state.
     * @param {CartState}             state  - Current state of the slice.
     * @param {PayloadAction<object>} action - Tab key and active flag.
     */
    setTabsState(
      state: CartState,
      action: PayloadAction<{ key: keyof TabsState; value: boolean }>,
    ) {
      state.tabsState[action.payload.key].isActive = action.payload.value;
    },
    /**
     * Store the filtered entity IDs for a tab.
     *
     * Used for cross-tab filtering — e.g. MastersList writes the available master
     * IDs so SalonsList can narrow salons to those served by at least one master.
     * @param {CartState}             state  - Current state of the slice.
     * @param {PayloadAction<object>} action - Tab key and ID array (or null).
     */
    setTabDataIds(
      state: CartState,
      action: PayloadAction<{
        key: keyof TabsState;
        value: number[] | null;
      }>,
    ) {
      state.tabsState[action.payload.key].dataIds = action.payload.value;
    },
  },
});

export const {
  addServiceToCart,
  removeAllServices,
  setCartVersion,
  setTabsState,
  setTabDataIds,
} = cartSlice.actions;

/**
 * Select the raw cart items array (IDs only).
 *
 * Use `useCartItem` from `@/app/store/useCartItem` to get hydrated entities.
 * @param   {object}     state                          - The Redux store state.
 * @param   {object}     state.cartReducer              - The cart reducer state.
 * @param   {CartItem[]} state.cartReducer.servicesData - Normalized cart rows.
 * @returns {CartItem[]}                                Array of cart items.
 */
export const selectCartData = (state: {
  cartReducer: { servicesData: CartItem[] };
}): CartItem[] => state.cartReducer.servicesData;

/**
 * Count the cart rows the user has actually picked something into.
 *
 * NOT `servicesData.length`, which is a constant 1: `initialState` seeds one
 * empty row (`[{ id: 0 }]`), {@link addServiceToCart} merges into the row
 * matching `payload.id`, and every call site passes {@link selectActiveItemId},
 * which is seeded to 0 and never written (multi-row booking is vestigial). A
 * row only counts once it carries a real selection, so an untouched cart
 * counts 0.
 *
 * Returns a number, so subscribers re-render only when the count itself
 * changes despite the intermediate filter allocating.
 * @param   {object}     state                          - The Redux store state.
 * @param   {object}     state.cartReducer              - The cart reducer state.
 * @param   {CartItem[]} state.cartReducer.servicesData - Normalized cart rows.
 * @returns {number}                                    Number of rows holding a salon, service, product or master
 */
export const selectFilledCartCount = (state: {
  cartReducer: { servicesData: CartItem[] };
}): number =>
  state.cartReducer.servicesData?.filter(
    (row) =>
      row.salonId != null ||
      row.serviceId != null ||
      row.productId != null ||
      row.masterId != null,
  ).length ?? 0;

/**
 * Select the index of the currently active cart row.
 *
 * Legacy value — always 0 in practice, multi-row booking was never wired up.
 * @param   {object} state                          - The Redux store state.
 * @param   {object} state.cartReducer              - The cart reducer state.
 * @param   {number} state.cartReducer.activeItemId - Active row index.
 * @returns {number}                                Current active item id.
 */
export const selectActiveItemId = (state: {
  cartReducer: { activeItemId: number };
}): number => state.cartReducer.activeItemId;

/**
 * Select a tab's state by key.
 * @param   {string}    key                         - The tab key.
 * @param   {object}    state                       - The Redux store state.
 * @param   {object}    state.cartReducer           - The cart reducer state.
 * @param   {TabsState} state.cartReducer.tabsState - The state of each tab.
 * @returns {TabState}                              Tab state object.
 */
export const selectTabsState = (
  key: keyof TabsState,
  state: { cartReducer: { tabsState: TabsState } },
): TabState => state.cartReducer.tabsState[key];

/**
 * Select a tab's filtered entity IDs by key.
 * @param   {string}          key                         - The tab key.
 * @param   {object}          state                       - The Redux store state.
 * @param   {object}          state.cartReducer           - The cart reducer state.
 * @param   {TabsState}       state.cartReducer.tabsState - The state of each tab.
 * @returns {number[] | null}                             Array of entity IDs or null.
 */
export const selectTabDataIds = (
  key: keyof TabsState,
  state: { cartReducer: { tabsState: TabsState } },
): number[] | null => state.cartReducer.tabsState[key].dataIds;

export default cartSlice.reducer;
