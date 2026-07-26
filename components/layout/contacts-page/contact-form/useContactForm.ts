'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useState } from 'react';

import { getApi, isError as isSdkError } from '@/app/api/api/api';
import { useGetFormByMarkerQuery } from '@/app/api/api/RTKApi';
import { getFormAttributes } from '@/components/utils/getFormAttributes';
import { toErrorMessage } from '@/components/utils/toErrorMessage';

import { buildContactAnswers } from './buildContactAnswers';
import { mintCaptchaToken } from './mintCaptchaToken';
import type { ContactFormField, FieldKey } from './types';
import { EMPTY_CONTACT_FIELDS } from './types';

/**
 * State and actions the "Write to us" card renders from.
 * @property {Record<FieldKey, string>}                         fields          - Current values, keyed by field
 * @property {(key: FieldKey) => (value: string) => void}       set             - Curried setter for one field
 * @property {boolean}                                          sent            - The success state is showing
 * @property {boolean}                                          loading         - A submit is in flight
 * @property {string}                                           error           - Failure copy (`''` when none)
 * @property {string}                                           spamSiteKey     - reCAPTCHA site key from the CMS (`''` when the form has no captcha)
 * @property {Dispatch<SetStateAction<boolean>>}                setCaptchaReady - Mark the reCAPTCHA library as ready to mint tokens (`FormReCaptcha` setter)
 * @property {boolean}                                          captchaReady    - The reCAPTCHA library is loaded
 * @property {string}                                           successMessage  - Success copy from the form's CMS settings, with a fallback
 * @property {(e: FormEvent<HTMLFormElement>) => Promise<void>} handleSubmit    - Submit handler for the `<form>`
 */
export interface ContactFormState {
  fields: Record<FieldKey, string>;
  set: (key: FieldKey) => (value: string) => void;
  sent: boolean;
  loading: boolean;
  error: string;
  spamSiteKey: string;
  setCaptchaReady: Dispatch<SetStateAction<boolean>>;
  captchaReady: boolean;
  successMessage: string;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * useContactForm — the controller of the contacts page's "Write to us" card.
 *
 * Submission goes to the `contact_us` CMS form: local values are mapped onto
 * the form attributes by marker ({@link buildContactAnswers}). Should the form
 * lose its fields in the admin, the submit degrades to the mock's local success
 * state without an API call.
 *
 * A `spam` field makes the reCAPTCHA token mandatory server-side. Without a
 * configured site key (or a loaded reCAPTCHA library) no token can be minted
 * and the CMS rejects the submit, so the form degrades the same way instead of
 * surfacing a 400 to the visitor.
 * @returns {ContactFormState} Field values, submit handler and captcha wiring
 */
export const useContactForm = (): ContactFormState => {
  const [fields, setFields] =
    useState<Record<FieldKey, string>>(EMPTY_CONTACT_FIELDS);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /** `true` once the reCAPTCHA v3 library is loaded and ready to mint tokens. */
  const [captchaReady, setCaptchaReady] = useState(false);

  /** CMS form definition — its attributes may be `[]`-like or `{}` */
  const { data } = useGetFormByMarkerQuery({ marker: 'contact_us' });

  /**
   * The form's captcha field, if any. Its presence and site key gate whether
   * the submit can reach the CMS. The reCAPTCHA v3 site key lives in
   * `settings.captcha.key` (NOT `validators` — that stays empty for `spam`).
   */
  const spamField = getFormAttributes<{
    type: string;
    marker: string;
    settings?: { captcha?: { key?: string; action?: string } };
  }>(data).find((field) => field.type === 'spam');
  const spamSiteKey = spamField?.settings?.captcha?.key ?? '';
  /** reCAPTCHA action for scoring — OneEntry stores it in `settings.captcha`. */
  const spamAction = spamField?.settings?.captcha?.action ?? 'login';

  const set = (key: FieldKey) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  /**
   * Submit the form to the `contact_us` CMS form when it has fields; degrade
   * to the mock's local success state while it has none.
   * @param   {FormEvent<HTMLFormElement>} e - Form submission event
   * @returns {Promise<void>}                Resolves when the submit settles
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    /** Data fields of the CMS form (buttons/captcha excluded) */
    const formFields = getFormAttributes<ContactFormField>(data).filter(
      (field) => field.type !== 'button' && field.type !== 'spam',
    );

    const canSubmitToCms =
      formFields.length > 0 &&
      (!spamField || (spamSiteKey !== '' && captchaReady));

    try {
      setLoading(true);
      if (canSubmitToCms) {
        const formData = buildContactAnswers({
          fields: formFields,
          values: fields,
        });

        /**
         * The captcha travels as the `spam` attribute's value — the CMS
         * requires the attribute whenever the form defines one, and expects the
         * validation OBJECT `{ event: { token, siteKey } }`, NOT the bare token
         * string.
         */
        if (spamField) {
          const token = await mintCaptchaToken({
            siteKey: spamSiteKey,
            action: spamAction,
          });
          formData.push({
            marker: spamField.marker,
            type: 'spam',
            value: { event: { token, siteKey: spamSiteKey } },
          });
        }

        /**
         * Module routing comes from the form itself (where the CMS should
         * deliver the submission) — hardcoding 0/'' detaches the answer from
         * its module config.
         */
        const moduleConfig = data?.moduleFormConfigs?.[0];

        /**
         * `postFormsData` returns `IPostFormResponse | IError` — an API failure
         * is a value, not a thrown error. Check it so a failed submit does not
         * show the "Message sent!" success state.
         */
        const result = await getApi().FormData.postFormsData({
          formIdentifier: 'contact_us',
          formData,
          formModuleConfigId: moduleConfig?.id ?? 0,
          moduleEntityIdentifier:
            moduleConfig?.entityIdentifiers?.[0]?.id ?? '',
          replayTo: null,
          /**
           * Empty status, not `'sent'` — with an empty `moduleFormConfigs` (the
           * case here) a `'sent'` status makes the backend look up a delivery
           * config by `formModuleConfigId` (0) and reject with "Incorrect
           * formIdentifier for provided config". Matches the working reference.
           */
          status: '',
        });
        if (isSdkError(result)) {
          /**
           * Mirror the success path: the failure copy comes from the form's own
           * CMS settings when set (`unsuccessMessage`), with the technical
           * status/message as the fallback while it is empty.
           */
          setError(
            data?.localizeInfos?.unsuccessMessage ||
              `Error ${result.statusCode}: ${result.message ?? ''}`.trim(),
          );
          return;
        }
      }
      setSent(true);
      setFields(EMPTY_CONTACT_FIELDS);
      setTimeout(() => setSent(false), 3500);
    } catch (err) {
      /** A thrown (network) failure is still a failed submit — same CMS copy. */
      setError(data?.localizeInfos?.unsuccessMessage || toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    fields,
    set,
    sent,
    loading,
    error,
    spamSiteKey,
    captchaReady,
    setCaptchaReady,
    successMessage: data?.localizeInfos?.successMessage || 'Message sent!',
    handleSubmit,
  };
};
