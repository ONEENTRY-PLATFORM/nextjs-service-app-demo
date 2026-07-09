import { useDispatch, useSelector, useStore } from 'react-redux';

import {
  type AppDispatch,
  type AppStore,
  type RootState,
} from '@/app/store/store';

/**
 * Typed dispatch hook for Redux store.
 * @returns {AppDispatch} The dispatch function with typed actions.
 * @see {@link https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type|Redux Toolkit TypeScript Guide}
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed selector hook for Redux store.
 * @returns A selector function that is properly typed for the store's root state.
 * @see {@link https://redux-toolkit.js.org/usage/usage-with-typescript#typing-useselector|Redux Toolkit TypeScript Guide}
 */
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * Typed store hook for Redux store.
 * @returns The store instance with proper typing.
 * @see {@link https://redux-toolkit.js.org/usage/usage-with-typescript#typing-useselector|Redux Toolkit TypeScript Guide}
 */
export const useAppStore = useStore.withTypes<AppStore>();
