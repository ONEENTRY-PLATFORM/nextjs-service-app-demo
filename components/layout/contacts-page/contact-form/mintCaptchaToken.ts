/**
 * mintCaptchaToken — a fresh reCAPTCHA Enterprise token for the form's `spam`
 * attribute.
 *
 * Minted at submit time rather than on mount on purpose: v3 tokens expire after
 * roughly two minutes, so one cached earlier could already be stale by the time
 * the visitor presses Send. Returns `''` when the library has not loaded or no
 * site key is configured — the caller then degrades instead of posting a submit
 * the CMS would reject.
 * @param   {object}          input         - Input
 * @param   {string}          input.siteKey - reCAPTCHA site key from `settings.captcha.key`
 * @param   {string}          input.action  - Action name used for scoring
 * @returns {Promise<string>}               Token, or `''` when unavailable
 */
export const mintCaptchaToken = async ({
  siteKey,
  action,
}: {
  siteKey: string;
  action: string;
}): Promise<string> => {
  if (!siteKey || typeof window === 'undefined' || !window.grecaptcha) {
    return '';
  }
  return window.grecaptcha.enterprise.execute(siteKey, { action });
};
