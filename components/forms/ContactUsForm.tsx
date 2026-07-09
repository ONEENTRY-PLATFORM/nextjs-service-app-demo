'use client';

import type { IAttributes } from 'oneentry/dist/base/utils';
import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { getApi, useGetFormByMarkerQuery } from '@/app/api';
import { useAppSelector } from '@/app/store/hooks';
import { getFormAttributes } from '@/components/utils';

import SpinnerLoader from '../shared/SpinnerLoader';
import ErrorMessage from './inputs/ErrorMessage';
import FormCaptcha from './inputs/FormCaptcha';
import FormInput from './inputs/FormInput';
import FormSubmitButton from './inputs/FormSubmitButton';

/**
 * ContactUsForm component renders a contact form for users to send messages.
 *
 * This component integrates with the OneEntry CMS form system and includes reCAPTCHA protection.
 * It fetches form configuration from the OneEntry CMS, renders the appropriate form fields,
 * and handles form submission with validation and reCAPTCHA protection.
 *
 * The form uses Redux to manage field states and RTK Query to fetch form configuration.
 * It transforms form data according to OneEntry API requirements before submission.
 * @param   {object}      props           - Component properties
 * @param   {string}      props.className - CSS classes to apply to the form container
 * @returns {JSX.Element}                 JSX.Element representing the contact form
 */
const ContactUsForm = ({ className }: { className: string }): JSX.Element => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /** Fetch form data by marker using RTK Query */
  const { data, isLoading } = useGetFormByMarkerQuery({ marker: 'contact_us' });

  /** Get form fields data from Redux store */
  const fieldsData = useAppSelector((state) => state.formFieldsReducer.fields);

  /** Sort form fields by position to maintain correct order */
  const formFields = getFormAttributes(data).sort(
    (a: { position: number }, b: { position: number }) =>
      a.position - b.position,
  );

  /**
   * Handle form submission
   * @param   {FormEvent<HTMLFormElement>} e - The form submission event
   * @returns {Promise<void>}                A promise that resolves when the submission is complete
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /** Early return if form fields or reCAPTCHA token are missing */
    if (!formFields.length || !token) return;

    /** Transform form data to match API requirements */
    const transformedFormData = formFields.map(
      (field: { marker: string; type: string }) => {
        /** Extract field marker */
        const { marker } = field;
        /** Get field value from Redux store */
        const value = fieldsData[marker as keyof typeof fieldsData]?.value;

        /** Transform field data based on marker type */
        switch (marker) {
          case 'spam':
          case 'send':
            return { marker, type: 'string', value: 'test' };
          case 'list':
            return { marker, type: 'list', value: [{ title: value, value }] };
          case 'text':
            return {
              marker,
              type: 'text',
              value: [{ htmlValue: value, plainValue: value }],
            };
          default:
            return { marker, type: 'string', value };
        }
      },
    );

    /** Submit form data to API */
    try {
      /** Set loading state to true during submission */
      setLoading(true);
      /** Send form data to backend API */
      await getApi().FormData.postFormsData({
        formIdentifier: 'contact_us',
        formData: transformedFormData,
        formModuleConfigId: 0,
        moduleEntityIdentifier: '',
        replayTo: null,
        status: '',
      });
    } catch (error) {
      /** Set error message if submission fails */
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      /** Reset loading state after submission attempt */
      setLoading(false);
    }
  };

  /** Show loading spinner while form data is being fetched */
  if (isLoading) {
    return <SpinnerLoader />;
  }

  /** Render contact us form with all fields */
  return (
    <form
      className={`flex min-h-full w-full max-w-107.5 flex-col gap-4 text-xl leading-5 ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="relative mb-4 box-border flex shrink-0 flex-col gap-4">
        {formFields.map((field: IAttributes, index: number) => {
          switch (field.type) {
            case 'button':
              return (
                <FormSubmitButton
                  key={index}
                  title={field.localizeInfos.title}
                  isLoading={loading}
                  index={10}
                />
              );
            case 'spam':
              return (
                <div key={index}>
                  <FormCaptcha
                    setToken={setToken}
                    setIsCaptcha={() => {}}
                    captchaKey={(field.settings?.captchaKey as string) || ''}
                  />
                </div>
              );
            default:
              return <FormInput key={index} index={index} {...field} />;
          }
        })}
      </div>

      {error && <ErrorMessage error={error} />}
    </form>
  );
};

export default ContactUsForm;
