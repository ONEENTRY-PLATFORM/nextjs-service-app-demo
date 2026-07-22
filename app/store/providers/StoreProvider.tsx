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
    // One-time cleanup: the form-fields slice used to be persisted, which left
    // plaintext passwords in localStorage on returning visitors. The slice is no
    // longer persisted (see store.ts), so the stale key is dropped on bootstrap.
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('persist:form-fields');
    }

    const storeInstance = setupStore();
    persistStore(storeInstance);
    return storeInstance;
  });

  return <Provider store={store}>{children}</Provider>;
}
