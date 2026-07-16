/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { FormEvent, JSX } from 'react';
import { useContext, useState } from 'react';

import { getApi, isError as isSdkError } from '@/app/api';
import { useAppSelector } from '@/app/store/hooks';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import type { FormProps } from '@/app/types/global';
import FormAnimations from '@/components/forms/animations/FormAnimations';
import { EVENT_PASSWORD_RESET } from '@/components/forms/authEventMarkers';

import ErrorMessage from './inputs/ErrorMessage';
import FormInput from './inputs/FormInput';
import FormSubmitButton from './inputs/FormSubmitButton';

/**
 * Fields of the reset-password step.
 *
 * Synthesized locally rather than read from the CMS: the reset step is reached
 * with only an OTP, so there is no user form to pull attributes from. They are
 * still shaped as real `IFormAttribute`s so `FormInput` treats them exactly like
 * CMS-authored fields — `isPassword` is what masks the input, and marking both
 * fields with it means the confirm field no longer relies on FormInput's
 * marker-name fallback.
 *
 * `isSignUpRequired` is the flag FormInput actually reads. These fields used to
 * carry a plain `required: true`, which FormInput never looks at, so both inputs
 * rendered as optional despite the form refusing to submit without them; naming
 * the flag correctly makes the markup agree with that validation.
 * @param   {string}         marker - Field marker, matching the CMS registration form
 * @param   {string}         title  - Label shown above the input
 * @returns {IFormAttribute}        Field definition for `FormInput`
 */
const passwordField = (
  marker: string,
  title: string,
): IFormAttribute & { placeholder: string } => ({
  marker,
  type: 'string',
  position: 0,
  isVisible: true,
  localizeInfos: { title } as IFormAttribute['localizeInfos'],
  initialValue: null,
  listTitles: [],
  validators: {},
  settings: {},
  additionalFields: {},
  isLogin: false,
  isSignUp: false,
  isPassword: true,
  isSignUpRequired: true,
  isNotificationEmail: false,
  isNotificationPhonePush: false,
  isNotificationPhoneSMS: false,
  placeholder: '•••••',
});

export const resetPasswordFormFields = [
  passwordField('password_reg', 'Password'),
  passwordField('password_confirm', 'Confirm password'),
];

/**
 * Reset password form.
 * @param   {FormProps}        props      - Form props.
 * @param   {IAttributeValues} props.dict - dictionary from server api.
 * @returns {JSX.Element}                 Reset password form.
 */
const ResetPasswordForm = ({ dict }: FormProps): JSX.Element => {
  /** Get form field values from Redux store */
  const { email_reg, password_reg, password_confirm, otp_code } =
    useAppSelector((state) => state.formFieldsReducer.fields);
  /** Access drawer context to control component display and actions */
  const { setComponent, setAction } = useContext(OpenDrawerContext);
  /** State for managing loading status during form submission */
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState('');

  /** Extract localized text values from dictionary */
  const { new_password_desc, change_password_text } = dict;

  /**
   * Change password with API AuthProvider
   * @param {FormEvent<HTMLFormElement>} e FormEvent
   */
  const onResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /** Validate required fields before submission */
    if (!email_reg || !otp_code || !password_reg || !password_confirm) {
      return;
    }
    /** Set loading state to true during submission */
    setLoading(true);

    /** Attempt to reset password via API */
    try {
      /**
       * Call API to change user password. `changePassword` returns
       * `boolean | IError` — a truthy IError must not be treated as success,
       * so check the error envelope and require an explicit `true`.
       */
      const result = await getApi().AuthProvider.changePassword(
        'email',
        email_reg.value,
        EVENT_PASSWORD_RESET,
        1,
        otp_code.value.toString(),
        password_reg.value,
        password_confirm.value,
      );

      if (isSdkError(result)) {
        setError(result.message || 'Could not change the password');
        return;
      }
      /** Redirect to sign in form only on a confirmed success */
      if (result === true) {
        setComponent('SignInForm');
        setAction('');
      } else {
        setError('Could not change the password. Please try again.');
      }
    } catch (error) {
      /** Set error message if password change fails */
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      /** Reset loading state after submission attempt */
      setLoading(false);
    }
  };

  return (
    <FormAnimations className={''} isLoading={isLoading} isActive={true}>
      <form
        name="resetPasswordForm"
        data-testid="auth-form-reset-password"
        className="mx-auto flex min-h-full w-full max-w-107.5 flex-col gap-4 text-xl leading-5"
        onSubmit={onResetSubmit}
      >
        {/** Display password reset description text */}
        <div className="relative box-border flex shrink-0 flex-col gap-2.5">
          <p className="max-w-full text-xs text-gray-400">
            {new_password_desc?.value}
          </p>
        </div>
        {/** Render reset password form fields */}
        <div className="relative mb-8 box-border flex shrink-0 flex-col gap-4">
          {resetPasswordFormFields.map((field, index) => (
            <FormInput key={index} index={index} {...field} />
          ))}
        </div>
        {/** Display submit button for password reset */}
        <FormSubmitButton
          title={change_password_text?.value}
          isLoading={isLoading}
          index={10}
        />
        {/** Display error message if present */}
        {isError && <ErrorMessage error={isError} />}
      </form>
    </FormAnimations>
  );
};

export default ResetPasswordForm;
