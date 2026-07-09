import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type {
  IOrderProductData,
  IOrdersFormData,
} from 'oneentry/dist/orders/ordersInterfaces';

import type { IAppOrder } from '@/app/types/global';

/**
 * Type definition for the order state in the Redux store.
 *
 * Represents the structure of the order state, including order data,
 * currency information, and available payment methods.
 */
type InitialStateType = {
  order: IAppOrder;
  currency?: string;
  paymentMethods?: Array<{
    identifier: string;
  }>;
};

/**
 * Initial state for the order reducer.
 *
 * Defines the default values for the order state when the application starts
 * or when the state is reset.
 */
const initialState: InitialStateType = {
  order: {
    formData: [],
    products: [],
    formIdentifier: 'order',
  },
};

/**
 * @name orderReducer
 * Redux slice for managing order state.
 *
 * This slice handles all order-related state including form data,
 * products, payment methods, and currency information.
 */
const orderReducer = createSlice({
  initialState,
  name: 'order',
  reducers: {
    // Create a new order if none exists.
    createOrder(state, action: PayloadAction<IAppOrder>) {
      if (!state.order) {
        state.order = action.payload;
      }
    },
    // Reset the order back to initial state.
    removeOrder(state) {
      state.order = initialState.order;
    },
    // Upsert a single form field on the order, keyed by marker.
    addData(
      state,
      action: PayloadAction<IOrdersFormData & { valid?: boolean }>,
    ) {
      if (!state.order) {
        return;
      }
      const index = state.order.formData.findIndex(
        (item) => item.marker === action.payload.marker,
      );

      if (index !== -1) {
        state.order.formData[index] = action.payload;
      } else {
        state.order.formData.push(action.payload);
      }
    },
    // Replace the order's products array.
    addProducts(state, action: PayloadAction<IOrderProductData[]>) {
      if (!state.order) {
        return;
      }
      state.order.products = action.payload;
    },
    // Set available payment methods (only if not already set).
    addPaymentMethods(
      state,
      action: PayloadAction<Array<{ identifier: string }>>,
    ) {
      if (!state.paymentMethods) {
        state.paymentMethods = action.payload;
      }
    },
    // Set the selected payment method identifier on the order.
    addPaymentMethod(state, action: PayloadAction<string>) {
      if (!state.order) {
        return;
      }
      state.order.paymentAccountIdentifier = action.payload;
    },
    // Set the currency for the order.
    addOrderCurrency(state, action: PayloadAction<string>) {
      if (!state.order) {
        return;
      }
      state.currency = action.payload;
    },
  },
});

export const {
  removeOrder,
  createOrder,
  addData,
  addProducts,
  addPaymentMethods,
  addPaymentMethod,
  addOrderCurrency,
} = orderReducer.actions;

export default orderReducer.reducer;
