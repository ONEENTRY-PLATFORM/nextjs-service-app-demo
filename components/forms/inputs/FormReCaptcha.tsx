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
 * FormReCaptcha component — loader for invisible reCAPTCHA v3 Enterprise used by
 * the `spam` field of a OneEntry form. It injects the reCAPTCHA `enterprise.js`
 * script for the given `siteKey` and flips `setIsReady(true)` once the library
 * is ready; the parent form then pulls a FRESH token at submit time via
 * `window.grecaptcha.enterprise.execute` (v3 tokens expire after ~2 min, so
 * caching one on mount would go stale for a visitor who lingers). Renders
 * nothing visible beyond the floating reCAPTCHA badge.
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
    if (scriptLoadedRef.current) return;

    /**
     * Signal readiness to the parent once `grecaptcha.enterprise` has loaded.
     * @returns {void}
     */
    const markReady = (): void => {
      if (typeof window === 'undefined' || !window.grecaptcha?.enterprise) {
        return;
      }
      window.grecaptcha.enterprise.ready(() => setIsReady(true));
    };

    const existing = document.querySelector(
      'script[src*="recaptcha/enterprise.js"]',
    );
    if (existing) {
      scriptLoadedRef.current = true;
      markReady();
      return;
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <></>;
};

export default FormReCaptcha;
