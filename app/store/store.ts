import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import type { PersistedState, Storage } from 'redux-persist';
import { createMigrate, persistReducer } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import { RTKApi } from '../api/api/RTKApi';
import animationsSlice from './reducers/AnimationsSlice';
import cartSlice from './reducers/CartSlice';
import formFieldsSlice from './reducers/FormFieldsSlice';

/**
 * Creates a noop (no operation) storage implementation that mimics the redux-persist storage interface.
 * This is used as a fallback when window object is not available (e.g., server-side rendering).
 * @returns {object} An object implementing the storage interface with noop methods that resolve promises immediately.
 */
const createNoopStorage = (): Storage => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: number) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

/**
 * Cart persist migrations.
 *
 * v2: CartSlice was normalized from holding full OneEntry entities
 * (`IPagesEntity`/`IProductsEntity`/`IAdminEntity`) to holding only IDs.
 * v3: the vestigial multi-row model (`servicesData: CartItem[]` + `activeItemId`)
 * was flattened to the three selection IDs held directly. Either older snapshot
 * has an incompatible shape, so the cart resets to its initial state.
 */
const cartMigrations = {
  2: (): PersistedState => undefined,
  3: (): PersistedState => undefined,
};

/**
 * Persist cartReducer — only the selection IDs; `version` is a runtime hydration
 * marker and must not be restored from storage.
 */
const cartReducer = persistReducer(
  {
    key: 'cart-slice',
    storage: storage,
    version: 3,
    whitelist: ['salonId', 'productId', 'masterId'],
    migrate: createMigrate(cartMigrations, { debug: false }),
  },
  cartSlice,
);

/**
 * Combine reducers
 *
 * `formFieldsReducer` is deliberately NOT persisted: the slice is a flat bag of
 * every form's field values keyed by marker, including password inputs, so
 * persisting it wrote plaintext credentials to localStorage where nothing ever
 * cleared them. In-memory it still serves its real purpose — handing values
 * between the auth forms, which mount one at a time.
 */
const rootReducer = combineReducers({
  cartReducer,
  formFieldsReducer: formFieldsSlice,
  animationsSlice,
  [RTKApi.reducerPath]: RTKApi.reducer,
});

/**
 * Setup redux store with persistence - save redux state in storage
 *
 * The return type is deliberately inferred: annotating it as `EnhancedStore`
 * erased the middleware-aware dispatch signature, so `AppDispatch` lost the
 * thunk overload and could not dispatch RTK Query `initiate`/`prefetch`
 * thunks (the one-shot order re-read in `CancelOrderButton` needs it).
 * @returns {AppStore} Redux store with persistence
 * @see {@link https://github.com/rt2zz/redux-persist?tab=readme-ov-file#nested-persists}
 */
export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: {
          /**
           * RTK Query manages its own immutability via Immer; double-checking
           * its cache slice is wasted work on every dispatch.
           */
          ignoredPaths: ['api'],
        },
      }).concat(RTKApi.middleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const wrapper = createWrapper<AppStore>(setupStore, { debug: false });
