'use client';

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state for the animations reducer
 */
const initialState: {
  readyState: boolean;
} = {
  readyState: false,
};

/**
 * Redux slice for managing animation state
 *
 * This slice handles the state related to animations throughout the application,
 * particularly the readyState flag that indicates when animations can be played.
 * @name animationsSlice
 * @example
 * ```typescript
 * import { animationsSlice } from './AnimationsSlice';
 *
 * // In store configuration
 * const store = configureStore({
 *   reducer: {
 *     animations: animationsSlice.reducer
 *   }
 * });
 * ```
 */
export const animationsSlice = createSlice({
  name: 'animations-slice',
  initialState,
  reducers: {
    /**
     * Set the animation ready state
     * @param {typeof initialState}               state  - Current state of the slice
     * @param {PayloadAction<{ value: boolean }>} action - Payload action containing the new ready state value
     */
    setReadyState(
      state: typeof initialState,
      action: PayloadAction<{ value: boolean }>,
    ) {
      state.readyState = action.payload.value;
    },
  },
});

export const { setReadyState } = animationsSlice.actions;

/**
 * Selector to get the animation ready state from the Redux store
 * @param   {object}  state                              - The Redux store state
 * @param   {object}  state.animationsReducer            - The animations slice of the Redux store
 * @param   {boolean} state.animationsReducer.readyState - The animation ready state
 * @returns {object}                                     Object containing the animation ready state
 */
export const getReadyState = (state: {
  animationsReducer: {
    readyState: boolean;
  };
}): object => state.animationsReducer;

export default animationsSlice.reducer;
