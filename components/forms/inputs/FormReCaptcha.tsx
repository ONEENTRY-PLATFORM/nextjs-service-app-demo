'use client';

import type { Dispatch, JSX, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      };
    };
  }
}

/**
 * Toggle visibility of the floating reCAPTCHA badge. The badge lives in a
 * container appended to `<body>` by the reCAPTCHA script itself, outside the
 * React tree, so it survives page navigation; hiding it via `visibility` is
 * the approach Google documents (the script cannot be unloaded cleanly).
 * @param   {boolean} visible - Whether the badge should be shown
 * @returns {void}
 */
const setBadgeVisible = (visible: boolean): void => {
  document
    .querySelectorAll<HTMLElement>('.grecaptcha-badge')
    .forEach((badge) => {
      badge.style.visibility = visible ? 'visible' : 'hidden';
    });
};

/**
 * FormReCaptcha component — loader for invisible reCAPTCHA v3 Enterprise used by
 * the `spam` field of a OneEntry form. It injects the reCAPTCHA `enterprise.js`
 * script for the given `siteKey` and flips `setIsReady(true)` once the library
 * is ready; the parent form then pulls a FRESH token at submit time via
 * `window.grecaptcha.enterprise.execute` (v3 tokens expire after ~2 min, so
 * caching one on mount would go stale for a visitor who lingers). Renders
 * nothing visible beyond the floating reCAPTCHA badge.
 *
 * The badge is shown only while this component is mounted: the script itself
 * cannot be unloaded (reCAPTCHA v3 has no disposal API, and re-inserting the
 * script double-initializes it), so on unmount the badge is hidden and
 * `setIsReady(false)` is signalled; a later re-mount reuses the already loaded
 * script and shows the badge again.
 *
 * The `siteKey` comes from the form attribute itself (`spam` field's
 * `settings.captcha.key`, set in the OneEntry admin). OneEntry validates the
 * token as reCAPTCHA Enterprise, and — critically — expects the `spam`
 * attribute's value to be the object `{ event: { token, siteKey } }`, not the
 * bare token string (the parent builds that shape).
 * @param   {object}                            props            - Component properties
 * @param   {string}                            props.siteKey    - reCAPTCHA Enterprise site key
 * @param   {Dispatch<SetStateAction<boolean>>} props.setIsReady - Flipped `true` once the reCAPTCHA library is ready
 * @returns {JSX.Element}                                        Empty fragment (no visible output)
 */
const FormReCaptcha = ({
  siteKey,
  setIsReady,
}: {
  siteKey: string;
  setIsReady: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  /** Guard so the script is appended only once per mount. */
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    /**
     * Signal readiness to the parent once `grecaptcha.enterprise` has loaded,
     * and re-show the badge (it may have been hidden by a previous unmount).
     * @returns {void}
     */
    const markReady = (): void => {
      if (typeof window === 'undefined' || !window.grecaptcha?.enterprise) {
        return;
      }
      window.grecaptcha.enterprise.ready(() => {
        setBadgeVisible(true);
        setIsReady(true);
      });
    };

    if (!scriptLoadedRef.current) {
      const existing = document.querySelector(
        'script[src*="recaptcha/enterprise.js"]',
      );
      if (existing) {
        scriptLoadedRef.current = true;
        markReady();
      } else {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          scriptLoadedRef.current = true;
          markReady();
        };
        script.onerror = () => setIsReady(false);
        document.head.appendChild(script);
      }
    }

    return () => {
      setIsReady(false);
      setBadgeVisible(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <></>;
};

export default FormReCaptcha;
