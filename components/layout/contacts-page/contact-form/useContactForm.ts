'use client';

import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useMemo, useState } from 'react';

import { getApi, isError as isSdkError } from '@/app/api/api/api';
import { useGetFormByMarkerQuery } from '@/app/api/api/RTKApi';
import { getFormAttributes } from '@/components/utils/getFormAttributes';
import { normalizeErrorMessage } from '@/components/utils/normalizeErrorMessage';
import { sortArrayByPosition } from '@/components/utils/sortArrayByPosition';
import { toErrorMessage } from '@/components/utils/toErrorMessage';

import { buildContactAnswers } from './buildContactAnswers';
import { mintCaptchaToken } from './mintCaptchaToken';

/**
 * State and actions the "Write to us" card renders from.
 * @property {IFormAttribute[]}                                 formFields      - Data fields of the CMS form in admin order (no buttons/captcha); `[]` while the form is empty
 * @property {boolean}                                          formLoading     - The CMS form definition is still being fetched
 * @property {Record<string, string>}                           fields          - Current values, keyed by CMS marker
 * @property {(key: string) => (value: string) => void}         set             - Curried setter for one field
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
  formFields: IFormAttribute[];
  formLoading: boolean;
  fields: Record<string, string>;
  set: (key: string) => (value: string) => void;
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
 * The card renders strictly from the CMS form definition: `formFields` are the
 * `contact_us` data attributes in admin order, the local values are keyed by
 * their markers, and the submit maps them back onto the fields
 * ({@link buildContactAnswers}). No local field list exists — should the form
 * lose its fields in the admin, the card renders nothing rather than a made-up
 * layout.
 *
 * A `spam` field makes the reCAPTCHA token mandatory server-side; it is minted
 * at submit time and travels as that attribute's value. A submit the CMS
 * rejects surfaces its failure copy — it never fakes the success state.
 * @returns {ContactFormState} Field values, submit handler and captcha wiring
 */
export const useContactForm = (): ContactFormState => {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /** `true` once the reCAPTCHA v3 library is loaded and ready to mint tokens. */
  const [captchaReady, setCaptchaReady] = useState(false);

  /** CMS form definition — its attributes may be `[]`-like or `{}` */
  const { data, isLoading } = useGetFormByMarkerQuery({ marker: 'contact_us' });

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

  /**
   * Data fields of the CMS form (buttons/captcha excluded) in admin order —
   * the card renders its inputs from this list, so labels, placeholders and
   * required flags follow the form definition instead of hardcoded copies.
   */
  const formFields = useMemo(
    () =>
      sortArrayByPosition(
        getFormAttributes<IFormAttribute>(data).filter(
          (field) => field.type !== 'button' && field.type !== 'spam',
        ),
      ),
    [data],
  );

  const set = (key: string) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  /**
   * Submit the card's values to the `contact_us` CMS form.
   * @param   {FormEvent<HTMLFormElement>} e - Form submission event
   * @returns {Promise<void>}                Resolves when the submit settles
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
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
        moduleEntityIdentifier: moduleConfig?.entityIdentifiers?.[0]?.id ?? '',
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
         * status/message as the fallback while it is empty. Validation 400s
         * send `message` as a string ARRAY — normalize it.
         */
        setError(
          data?.localizeInfos?.unsuccessMessage ||
            `Error ${result.statusCode}: ${normalizeErrorMessage(result.message)}`.trim(),
        );
        return;
      }
      setSent(true);
      setFields({});
      setTimeout(() => setSent(false), 3500);
    } catch (err) {
      /** A thrown (network) failure is still a failed submit — same CMS copy. */
      setError(data?.localizeInfos?.unsuccessMessage || toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    formFields,
    formLoading: isLoading,
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
