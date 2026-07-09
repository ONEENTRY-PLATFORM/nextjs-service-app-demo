'use client';

import type { IAttributes, IAttributeValues } from 'oneentry/dist/base/utils';
import type { FormEvent, JSX } from 'react';
import { useContext, useState } from 'react';

import { getApi, useGetFormByMarkerQuery } from '@/app/api';
import { useAppSelector } from '@/app/store/hooks';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import FormAnimations from '@/components/forms/animations/FormAnimations';

import SpinnerLoader from '../shared/SpinnerLoader';
import ErrorMessage from './inputs/ErrorMessage';
import FormInput from './inputs/FormInput';
import FormSubmitButton from './inputs/FormSubmitButton';

/**
 * ForgotPasswordForm component renders a form for password reset initiation.
 * Users can enter their email address to receive a verification code for password reset.
 * After submitting the email, it automatically transitions to the verification form.
 * @param   {object}           props      - Component props
 * @param   {IAttributeValues} props.dict - Dictionary containing localized strings
 * @returns {JSX.Element}                 ForgotPassword form component
 */
export const ForgotPasswordForm = ({
  dict,
}: {
  dict: IAttributeValues;
}): JSX.Element => {
  /** Access drawer context to control component display and actions */
  const { setComponent, setAction } = useContext(OpenDrawerContext);
  /** State for handling error messages */
  const [isError, setError] = useState<string>('');

  /** Extract localized text values from dictionary */
  const { reset_descr, send_text } = dict;

  /** Get form data with RTK from API */
  const { data, isLoading } = useGetFormByMarkerQuery({ marker: 'reg' });
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /**
   * Submit form
   * @param   {FormEvent<HTMLFormElement>} e - Form event
   * @returns {Promise<void>}                - Promise that resolves when the form is submitted
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!fields.email_reg) {
      return;
    }
    try {
      /** Generate verification code with API */
      await getApi().AuthProvider.generateCode(
        'email',
        fields.email_reg.value,
        'generate_otp',
      );
      /** Open Verification form */
      setComponent('VerificationForm');
      setAction('checkCode');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      if ((error as { statusCode?: number })?.statusCode === 400) {
        setTimeout(() => {
          setComponent('VerificationForm');
        }, 800);
      }
    }
  };

  /** Show loading spinner while form data is being fetched */
  if (!data || isLoading) {
    return <SpinnerLoader />;
  }

  /** Render forgot password form with email input and submit button */
  return (
    <FormAnimations className={''} isLoading={isLoading} isActive={true}>
      <form
        className="mx-auto flex min-h-120 max-w-87.5 flex-col gap-4 text-xl leading-5"
        onSubmit={handleSubmit}
      >
        <div className="relative box-border flex shrink-0 flex-col gap-2.5">
          <p className="text-xs text-gray-400 max-md:max-w-full">
            {reset_descr?.value as string | undefined}
          </p>
        </div>

        <div className="relative mb-8 box-border flex shrink-0 flex-col gap-4">
          {(data.attributes as unknown as IAttributes[] | undefined)
            ?.filter((field: IAttributes) => field.marker === 'email_reg')
            .map((field: IAttributes, index: number) => (
              <FormInput key={index} index={index} {...field} />
            ))}
        </div>

        <FormSubmitButton
          title={(send_text?.value as string | undefined) ?? ''}
          isLoading={isLoading}
          index={10}
        />
        {isError && <ErrorMessage error={isError} />}
      </form>
    </FormAnimations>
  );
};

export default ForgotPasswordForm;
