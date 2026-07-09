import { useEffect, useLayoutEffect } from 'react';

/**
 * A hook that uses useLayoutEffect on the client side and useEffect on the server side.
 *
 * This is useful for components that need to perform layout-related measurements
 * or DOM manipulations that should happen synchronously after rendering but before
 * the browser paints. On the server side, where DOM is not available, it falls back
 * to useEffect to prevent errors.
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   useIsomorphicLayoutEffect(() => {
 *     // This will run in the layout phase on the client,
 *     // but asynchronously on the server
 *     const element = document.getElementById('my-element');
 *     // perform DOM measurements or manipulations
 *   }, []);
 *
 *   return <div id="my-element">Content</div>;
 * };
 * ```
 * @see {@link https://reactjs.org/docs/hooks-reference.html#uselayouteffect|useLayoutEffect}
 * @see {@link https://reactjs.org/docs/hooks-reference.html#useeffect|useEffect}
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
