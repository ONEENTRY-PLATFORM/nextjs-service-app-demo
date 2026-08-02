'use client';

import { Send } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

import ErrorMessage from '../../forms/inputs/ErrorMessage';
import FormReCaptcha from '../../forms/inputs/FormReCaptcha';
import ContactCmsFields from './contact-form/ContactCmsFields';
import ContactFieldsSkeleton from './contact-form/ContactFieldsSkeleton';
import { useContactForm } from './contact-form/useContactForm';

/**
 * ContactFormCard component — the "Write to us" card of the contacts page:
 * the `contact_us` CMS form fields, the gradient submit button and the
 * "Message sent!" success state.
 *
 * The inputs render from the CMS form definition ({@link ContactCmsFields})
 * and from nothing else: while the definition loads the card holds its shape
 * with {@link ContactFieldsSkeleton}, and a form without fields renders no
 * card at all instead of a hardcoded layout. All state and the CMS submit live
 * in {@link useContactForm}; this component only renders.
 * @returns {JSX.Element | null} Contact form card, or nothing while the CMS form has no fields
 */
const ContactFormCard = (): JSX.Element | null => {
  const dict = useDict();
  const {
    formFields,
    formLoading,
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

  /** No CMS form (or an empty one) — degrade to nothing, never to mock copy. */
  if (!formLoading && formFields.length === 0) {
    return null;
  }

  return (
    <div
      className="flex h-full flex-col rounded-3xl border-[1.5px] border-slate-150 bg-white p-4 md:p-8"
      style={{ boxShadow: '0 4px 32px rgba(237,33,241,0.08)' }}
    >
      <p className="mb-6 ml-2 text-sm font-black tracking-[0.25em] text-accent-pink uppercase md:ml-0">
        {dictText(dict, 'write_to_us_text', 'Write to us')}
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
            {dictText(
              dict,
              'contact_success_sub_text',
              "We'll get back to you within 24 hours.",
            )}
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          data-testid="contact-form"
          className="flex flex-1 flex-col"
        >
          {/* Inputs come from the CMS form; the skeleton only holds its shape. */}
          {formLoading ? (
            <ContactFieldsSkeleton />
          ) : (
            <ContactCmsFields
              fields={formFields}
              values={fields}
              set={set}
              dict={dict}
            />
          )}

          {/*
            reCAPTCHA v3 for the `spam` field — invisible, rendered only once
            the admin has configured a site key. Without one the CMS rejects the
            submit and the card shows that failure (see `useContactForm`).
          */}
          {spamSiteKey && (
            <FormReCaptcha siteKey={spamSiteKey} setIsReady={setCaptchaReady} />
          )}

          {error && <ErrorMessage error={error} />}

          <button
            type="submit"
            disabled={
              loading || formLoading || (!!spamSiteKey && !captchaReady)
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-base font-bold tracking-wider text-white uppercase transition-transform duration-200 hover:scale-102 active:scale-95 disabled:opacity-70 md:mt-auto"
            style={{ boxShadow: '0 8px 24px #ed21f144' }}
          >
            <Send size={15} />{' '}
            {loading
              ? dictText(dict, 'sending_text', 'Sending…')
              : dictText(dict, 'send_message_text', 'Send Message')}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactFormCard;
