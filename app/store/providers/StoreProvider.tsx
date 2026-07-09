'use client';

import type { JSX, ReactNode } from 'react';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import { setupStore } from '../store';

/**
 * Store provider.
 * @param   {object}      props          - Component props
 * @param   {ReactNode}   props.children - children ReactNode.
 * @returns {JSX.Element}                Redux provider.
 */
export default function StoreProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  // Use lazy initialization to create store only once
  const [store] = useState(() => {
    const storeInstance = setupStore();
    persistStore(storeInstance);
    return storeInstance;
  });

  return <Provider store={store}>{children}</Provider>;
}
