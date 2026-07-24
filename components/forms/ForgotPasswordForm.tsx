'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { FormEvent, JSX } from 'react';
import { useContext, useState } from 'react';

import { getApi, isError as isSdkError } from '@/app/api/api/api';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import FormAnimations from '@/components/forms/animations/FormAnimations';
import { EVENT_PASSWORD_RESET } from '@/components/forms/authEventMarkers';
import { useCmsForm } from '@/components/forms/useCmsForm';
import { toErrorMessage } from '@/components/utils/toErrorMessage';

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
  const { setComponent, setAction, setDirection } =
    useContext(OpenDrawerContext);
  /** State for handling error messages */
  const [isError, setError] = useState<string>('');

  /** Extract localized text values from dictionary */
  const { reset_descr, send_text, err_send_code_failed } = dict;

  /** Get form data with RTK from API */
  const { attributes, fields, isLoading, hasForm } = useCmsForm('reg');

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
    setError('');
    /** Forgot → Verification is a forward step: slide in from the right. */
    setDirection('forward');
    try {
      /**
       * Generate the reset code. `generateCode` returns `boolean | IError` — an
       * API failure is a value, not a throw, so check it explicitly instead of
       * relying on the (dead) catch branch.
       */
      const result = await getApi().AuthProvider.generateCode(
        'email',
        fields.email_reg.value,
        EVENT_PASSWORD_RESET,
      );
      if (isSdkError(result)) {
        setError(
          result.message ||
            (err_send_code_failed?.value as string | undefined) ||
            'Could not send the verification code',
        );
        /** A 400 means a code is already active — let the user enter it. */
        if (result.statusCode === 400) {
          setComponent('VerificationForm');
          setAction('checkCode');
        }
        return;
      }
      /** Open Verification form */
      setComponent('VerificationForm');
      setAction('checkCode');
    } catch (error) {
      setError(toErrorMessage(error));
    }
  };

  /** Show loading spinner while form data is being fetched */
  if (!hasForm || isLoading) {
    return <SpinnerLoader />;
  }

  /** Render forgot password form with email input and submit button */
  return (
    <FormAnimations className={''} isLoading={isLoading} isActive={true}>
      <form
        data-testid="auth-form-forgot-password"
        className="mx-auto flex min-h-120 max-w-87.5 flex-col gap-4 text-xl leading-5"
        onSubmit={handleSubmit}
      >
        <div className="relative box-border flex shrink-0 flex-col gap-2.5">
          <p className="text-xs text-gray-400 max-md:max-w-full">
            {reset_descr?.value as string | undefined}
          </p>
        </div>

        <div className="relative mb-8 box-border flex shrink-0 flex-col gap-4">
          {attributes
            .filter((field: IFormAttribute) => field.marker === 'email_reg')
            .map((field: IFormAttribute, index: number) => (
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
