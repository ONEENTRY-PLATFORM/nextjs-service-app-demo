'use client';

import { Send } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import ErrorMessage from '../../forms/inputs/ErrorMessage';
import FormReCaptcha from '../../forms/inputs/FormReCaptcha';
import ContactFormField from './contact-form/ContactFormField';
import { useContactForm } from './contact-form/useContactForm';

/**
 * ContactFormCard component — the "Write to us" card of the contacts page as
 * in the static-html mock (`ContactsPage.tsx` → ContactForm): name/phone,
 * e-mail and message fields, the gradient submit button and the "Message
 * sent!" success state.
 *
 * All state and the CMS submit live in {@link useContactForm}; this component
 * only renders.
 * @returns {JSX.Element} Contact form card
 */
const ContactFormCard = (): JSX.Element => {
  const dict = useDict();
  const {
    fields,
    set,
    sent,
    loading,
    error,
    spamSiteKey,
    captchaReady,
    setCaptchaReady,
    successMessage,
    handleSubmit,
  } = useContactForm();

  return (
    <div
      className="flex h-full flex-col rounded-3xl border-[1.5px] border-slate-150 bg-white p-4 md:p-8"
      style={{ boxShadow: '0 4px 32px rgba(237,33,241,0.08)' }}
    >
      <p className="mb-6 ml-2 text-sm font-black tracking-[0.25em] text-accent-pink uppercase md:ml-0">
        {(dict?.write_to_us_text?.value as string | undefined) || 'Write to us'}
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
          <p className="text-lg font-bold text-slate-400">{successMessage}</p>
          <p className="text-sm text-neutral-300">
            {(dict?.contact_success_sub_text?.value as string | undefined) ||
              "We'll get back to you within 24 hours."}
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
              <ContactFormField
                label={
                  (dict?.contact_name_label?.value as string | undefined) ||
                  'Your name'
                }
                value={fields.name}
                onChange={set('name')}
                placeholder={
                  (dict?.contact_name_placeholder?.value as
                    string | undefined) || 'Jane Doe'
                }
                type="text"
              />
              <ContactFormField
                label={
                  (dict?.phone_text?.value as string | undefined) || 'Phone'
                }
                value={fields.phone}
                onChange={set('phone')}
                placeholder={
                  (dict?.contact_phone_placeholder?.value as
                    string | undefined) || '+971 50 123 4567'
                }
                type="tel"
              />
            </div>
            <ContactFormField
              label={
                (dict?.contact_email_label?.value as string | undefined) ||
                'E-mail'
              }
              value={fields.email}
              onChange={set('email')}
              placeholder={
                (dict?.contact_email_placeholder?.value as
                  string | undefined) || 'you@example.com'
              }
              type="email"
            />
            <div>
              <label className="mb-2.5 block text-base font-normal text-neutral-300">
                {(dict?.contact_message_label?.value as string | undefined) ||
                  'Message'}
              </label>
              <textarea
                value={fields.contact_text}
                onChange={(e) => set('contact_text')(e.target.value)}
                placeholder={
                  (dict?.contact_message_placeholder?.value as
                    string | undefined) || 'How can we help you?'
                }
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-240 px-4 py-3 text-base text-slate-400 transition-all outline-none focus:border-accent-pink"
              />
            </div>
          </div>

          {/*
            reCAPTCHA v3 for the `spam` field — invisible, rendered only once
            the admin has configured a site key. While it is absent the submit
            degrades to the local success state (see `useContactForm`).
          */}
          {spamSiteKey && (
            <FormReCaptcha siteKey={spamSiteKey} setIsReady={setCaptchaReady} />
          )}

          {error && <ErrorMessage error={error} />}

          <button
            type="submit"
            disabled={loading || (!!spamSiteKey && !captchaReady)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-base font-bold tracking-wider text-white uppercase transition-transform duration-200 hover:scale-102 active:scale-95 disabled:opacity-70 md:mt-auto"
            style={{ boxShadow: '0 8px 24px #ed21f144' }}
          >
            <Send size={15} />{' '}
            {loading
              ? (dict?.sending_text?.value as string | undefined) || 'Sending…'
              : (dict?.send_message_text?.value as string | undefined) ||
                'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactFormCard;
