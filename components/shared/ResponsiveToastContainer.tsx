'use client';

import dynamic from 'next/dynamic';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

/** Toast host is client-only and never part of the initial payload. */
const LazyToastContainer = dynamic(() => import('./LazyToastContainer'), {
  ssr: false,
});

/**
 * ResponsiveToastContainer — mounts the toast host only once the browser is
 * idle.
 *
 * Toasts are never shown on first paint, so neither `react-toastify` nor its
 * stylesheet belong in the initial chunk of every route. Deferring the mount to
 * `requestIdleCallback` (with a timeout fallback for browsers without it) keeps
 * the toast machinery off the critical path while staying ready well before any
 * user action can trigger a toast.
 * @returns {JSX.Element} The toast host, or nothing until the browser is idle
 */
const ResponsiveToastContainer = (): JSX.Element => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const idle = (
      window as Window & {
        requestIdleCallback?: (cb: () => void) => number;
      }
    ).requestIdleCallback;

    if (typeof idle === 'function') {
      const id = idle(() => setMounted(true));
      return () => {
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(id);
      };
    }

    const timer = setTimeout(() => setMounted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return mounted ? <LazyToastContainer /> : <></>;
};

export default ResponsiveToastContainer;
