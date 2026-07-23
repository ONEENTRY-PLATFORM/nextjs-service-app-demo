'use client';

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Cart selection — the single booking pre-selection the wizard restores.
 *
 * The cart holds only entity IDs, never the entities themselves: they are
 * re-hydrated at read sites through RTK Query, which keeps this slice small
 * enough for `redux-persist` and the immutability middleware.
 *
 * It used to model a multi-row cart (`servicesData: CartItem[]` with an
 * `activeItemId` index), but the array was always length 1, `activeItemId` was
 * never written, and of the row's fields only these three were ever read — so
 * the shape is now the three IDs directly. `serviceId`, `date` and `interval`
 * were written by producers but read by nobody (the wizard builds the order
 * from its own selection state, not the cart), and are dropped.
 */
interface CartState {
  salonId?: number;
  productId?: number;
  masterId?: number;
  /** Hydration marker AuthProvider bumps once the persisted cart is restored. */
  version: number;
}

/**
 * The three selection fields, the unit both reducers and the reader work in.
 *
 * Each is `T | undefined` (not just optional) because {@link selectCartSelection}
 * builds the object by destructuring, which writes `undefined` explicitly —
 * `exactOptionalPropertyTypes` rejects that against a plain `?:` property.
 */
type CartSelection = {
  salonId: number | undefined;
  productId: number | undefined;
  masterId: number | undefined;
};

/** Keys a selection payload may carry — kept in sync with {@link CartSelection}. */
const SELECTION_KEYS = ['salonId', 'productId', 'masterId'] as const;

/**
 * Initial state — nothing selected, version 0.
 */
const initialState: CartState = {
  version: 0,
};

/**
 * Redux slice for the booking pre-selection (salon / product / master).
 * @name cartSlice
 */
export const cartSlice = createSlice({
  name: 'cart-slice',
  initialState,
  reducers: {
    /**
     * Merge a selection: each provided field is set, `null` clears it, and an
     * omitted (`undefined`) field is left as-is.
     *
     * The clear-on-`null` contract is load-bearing — picking a product from
     * search passes `salonId: null` / `masterId: null` to drop a salon or master
     * left from an earlier flow, so a stale value never leaks across bookings.
     * @param {CartState}                    state  - Current slice state.
     * @param {PayloadAction<CartSelection>} action - Fields to merge (null clears).
     */
    addServiceToCart(
      state: CartState,
      action: PayloadAction<{
        salonId?: number | null;
        productId?: number | null;
        masterId?: number | null;
      }>,
    ) {
      const payload = action.payload;
      SELECTION_KEYS.forEach((key) => {
        const value = payload[key];
        if (value === null) {
          delete state[key];
        } else if (value !== undefined) {
          state[key] = value;
        }
      });
    },
    /**
     * Clear the whole selection, leaving the hydration `version` untouched.
     * @param {CartState} state - Current slice state.
     */
    removeAllServices(state: CartState) {
      SELECTION_KEYS.forEach((key) => delete state[key]);
    },
    /**
     * Set the cart version marker (used by AuthContext to detect hydration).
     * @param {CartState}             state  - Current slice state.
     * @param {PayloadAction<number>} action - New version number.
     */
    setCartVersion(state: CartState, action: PayloadAction<number>) {
      state.version = action.payload;
    },
  },
});

export const { addServiceToCart, removeAllServices, setCartVersion } =
  cartSlice.actions;

/**
 * Select the booking pre-selection (salon / product / master IDs).
 *
 * Read sites hydrate the entities themselves through RTK Query hooks.
 * @param   {object}        state                  - The Redux store state.
 * @param   {CartState}     state.cartReducer      - The cart reducer state.
 * @returns {CartSelection}                        The current selection IDs.
 */
export const selectCartSelection = (state: {
  cartReducer: CartState;
}): CartSelection => {
  const { salonId, productId, masterId } = state.cartReducer;
  return { salonId, productId, masterId };
};

/**
 * 1 when the cart holds any selection, 0 when it is empty — the nav badge count.
 *
 * Returns a number so subscribers re-render only when the count itself changes.
 * @param   {object}    state             - The Redux store state.
 * @param   {CartState} state.cartReducer - The cart reducer state.
 * @returns {number}                      1 if a salon, product or master is picked, else 0
 */
export const selectFilledCartCount = (state: {
  cartReducer: CartState;
}): number => {
  const { salonId, productId, masterId } = state.cartReducer;
  return salonId != null || productId != null || masterId != null ? 1 : 0;
};

export default cartSlice.reducer;
