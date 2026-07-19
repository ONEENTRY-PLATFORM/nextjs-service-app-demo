'use client';

import type { CSSProperties, JSX } from 'react';
import { useEffect } from 'react';

/**
 * Inline styles only — `global-error` replaces the root layout, so `globals.css`,
 * the font variables and every design token are unavailable here. Keeping the
 * fallback self-contained means it still renders when the CSS/font pipeline is
 * exactly what failed.
 */
const bodyStyle: CSSProperties = {
  margin: 0,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  padding: '2rem',
  textAlign: 'center',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  color: '#4c4d56',
  background: '#ffffff',
};

const buttonStyle: CSSProperties = {
  marginTop: '0.5rem',
  padding: '0.625rem 1.5rem',
  borderRadius: '9999px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  color: '#ffffff',
  background: 'linear-gradient(135deg, #ed21f1, #f60efb)',
};

/**
 * GlobalError — last-resort error boundary that replaces the ENTIRE document
 * when the root layout itself throws (a normal `error.tsx` cannot catch that,
 * since it renders *inside* the layout).
 *
 * Because the root layout has crashed, this component must render its own
 * `<html>` and `<body>` and cannot rely on any app chrome, providers or styles.
 * @param   {object}                      props       - Error boundary props injected by Next.js.
 * @param   {Error & { digest?: string }} props.error - The thrown error (`digest` is set in production).
 * @param   {() => void}                  props.reset - Attempts to re-render the app.
 * @returns {JSX.Element}                             Standalone fallback document.
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/error-handling Next.js docs}
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    // eslint-disable-next-line no-console -- a last-resort boundary should log
    console.error(error);
  }, [error]);

  return (
    <html lang="en-US">
      <body style={bodyStyle}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Site temporarily unavailable
        </h1>
        <p style={{ maxWidth: '28rem', margin: 0 }}>
          Something went wrong on our end. Please try again in a moment.
        </p>
        <button type="button" onClick={reset} style={buttonStyle}>
          Try again
        </button>
      </body>
    </html>
  );
}
