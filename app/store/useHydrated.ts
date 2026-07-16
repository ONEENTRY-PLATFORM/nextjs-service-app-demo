'use client';

import { useSyncExternalStore } from 'react';

/**
 * `useSyncExternalStore` subscriber for a value that never changes after
 * hydration. Hoisted to module scope so its identity is stable across renders
 * (a fresh closure would make React resubscribe on every render).
 * @returns {() => void} Unsubscribe no-op
 */
const subscribeNever = (): (() => void) => () => {};

/**
 * useHydrated — `false` during SSR *and* during the client's hydration render,
 * `true` from the very next commit onwards.
 *
 * Guard for anything whose markup depends on `redux-persist` state
 * (`cart-slice`, `form-fields`, `order-slice`): the server cannot know what
 * localStorage holds, so rendering a rehydrated value on the first client pass
 * makes the tree differ from the server HTML — React throws "Hydration failed"
 * and re-renders the whole page. Returning the server snapshot for the
 * hydration render keeps that first render identical to the server HTML; the
 * real value lands in the next commit.
 *
 * `useState` + `useEffect(() => setHydrated(true))` is not an option here — the
 * project's eslint rejects it with `react-hooks/set-state-in-effect`.
 *
 * Use it ONLY where a persisted value reaches the rendered output (markup,
 * text, attributes, className, style, a conditional branch). Gating a value
 * that is read solely in an event handler or an effect costs a needless extra
 * render and can flash.
 * @returns {boolean} `true` once the client has hydrated, `false` on the server and during the hydration render
 */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
