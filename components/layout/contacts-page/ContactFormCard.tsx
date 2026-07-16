'use client';

import { Send } from 'lucide-react';
import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import {
  getApi,
  isError as isSdkError,
  useGetFormByMarkerQuery,
} from '@/app/api';
import { getFormAttributes } from '@/components/utils';

import ErrorMessage from '../../forms/inputs/ErrorMessage';

/** Local field keys — matched against the CMS form attribute markers */
type FieldKey = 'name' | 'phone' | 'email' | 'message';

const EMPTY_FIELDS: Record<FieldKey, string> = {
  name: '',
  phone: '',
  email: '',
  message: '',
};

/**
 * FormField component — a labeled input of the contact form, styled as in the
 * static-html mock (`ContactsPage.tsx` → FormField).
 * @param   {object}              props             - Component properties
 * @param   {string}              props.label       - Field label above the input
 * @param   {string}              props.value       - Controlled input value
 * @param   {(v: string) => void} props.onChange    - Change handler receiving the new value
 * @param   {string}              props.placeholder - Input placeholder
 * @param   {string}              props.type        - HTML input type
 * @returns {JSX.Element}                           Labeled form input
 */
const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type: string;
}): JSX.Element => {
  return (
    <div>
      <label className="mb-2.5 block text-base font-normal text-neutral-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-240 px-4 py-3 text-base text-slate-400 transition-all outline-none focus:border-accent-pink"
      />
    </div>
  );
};

/**
 * ContactFormCard component — the "Write to us" card of the contacts page as
 * in the static-html mock (`ContactsPage.tsx` → ContactForm): name/phone,
 * e-mail and message fields, the gradient submit button and the "Message
 * sent!" success state.
 *
 * Submission goes to the `contact_us` CMS form: local values are mapped onto
 * the form attributes by marker. While the form has no fields in the admin
 * (the current state), the submit degrades to the mock's local success state
 * without an API call.
 * @returns {JSX.Element} Contact form card
 */
const ContactFormCard = (): JSX.Element => {
  const [fields, setFields] = useState<Record<FieldKey, string>>(EMPTY_FIELDS);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** CMS form definition — its attributes may be `[]`-like or `{}` */
  const { data } = useGetFormByMarkerQuery({ marker: 'contact_us' });

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
    const formFields = getFormAttributes(data).filter(
      (field: { type: string }) =>
        field.type !== 'button' && field.type !== 'spam',
    );

    try {
      setLoading(true);
      if (formFields.length > 0) {
        /**
         * Map local values onto the CMS attributes by marker, skipping fields
         * the user left blank — empty strings must not be submitted as answers.
         */
        const formData = formFields
          .filter(
            (field: { marker: string }) =>
              (fields[field.marker as FieldKey] ?? '') !== '',
          )
          .map((field: { marker: string; type: string }) => {
            const value = fields[field.marker as FieldKey] ?? '';
            if (field.type === 'text') {
              /** A `text` answer carries exactly ONE value key, not both. */
              return {
                marker: field.marker,
                type: 'text',
                value: [
                  {
                    plainValue: value,
                    params: { editorMode: 'plain' },
                  },
                ],
              };
            }
            return { marker: field.marker, type: 'string', value };
          });

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
          status: 'sent',
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
      setFields(EMPTY_FIELDS);
      setTimeout(() => setSent(false), 3500);
    } catch (err) {
      /** A thrown (network) failure is still a failed submit — same CMS copy. */
      setError(
        data?.localizeInfos?.unsuccessMessage ||
          (err instanceof Error ? err.message : 'An error occurred'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-full flex-col rounded-3xl border-[1.5px] border-slate-150 bg-white p-4 md:p-8"
      style={{ boxShadow: '0 4px 32px rgba(237,33,241,0.08)' }}
    >
      <p className="mb-6 ml-2 text-sm font-black tracking-[0.25em] text-accent-pink uppercase md:ml-0">
        Write to us
      </p>

      {sent ? (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <div
            className="mb-2 flex size-16 items-center justify-center rounded-full bg-gradient-brand"
            style={{ boxShadow: '0 0 32px #ed21f144' }}
          >
            <Send size={28} color="#fff" />
          </div>
          {/* Success copy comes from the form's own CMS settings when set. */}
          <p className="text-lg font-bold text-slate-400">
            {data?.localizeInfos?.successMessage || 'Message sent!'}
          </p>
          <p className="text-sm text-neutral-300">
            We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          data-testid="contact-form"
          className="flex flex-1 flex-col"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Your name"
                value={fields.name}
                onChange={set('name')}
                placeholder="Jane Doe"
                type="text"
              />
              <FormField
                label="Phone"
                value={fields.phone}
                onChange={set('phone')}
                placeholder="+971 50 123 4567"
                type="tel"
              />
            </div>
            <FormField
              label="E-mail"
              value={fields.email}
              onChange={set('email')}
              placeholder="you@example.com"
              type="email"
            />
            <div>
              <label className="mb-2.5 block text-base font-normal text-neutral-300">
                Message
              </label>
              <textarea
                value={fields.message}
                onChange={(e) => set('message')(e.target.value)}
                placeholder="How can we help you?"
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-240 px-4 py-3 text-base text-slate-400 transition-all outline-none focus:border-accent-pink"
              />
            </div>
          </div>

          {error && <ErrorMessage error={error} />}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-base font-bold tracking-wider text-white uppercase transition-transform duration-200 hover:scale-102 active:scale-95 disabled:opacity-70 md:mt-auto"
            style={{ boxShadow: '0 8px 24px #ed21f144' }}
          >
            <Send size={15} /> {loading ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactFormCard;
