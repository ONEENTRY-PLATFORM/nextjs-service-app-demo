/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type {
  IAuthPostBody,
  ISignUpData,
} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IAttributes } from 'oneentry/dist/base/utils';
import type { FormEvent, JSX } from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';

import { getApi, useGetFormByMarkerQuery } from '@/app/api';
import { isError } from '@/app/api';
import { useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import type { FormProps } from '@/app/types/global';
import FormAnimations from '@/components/forms/animations/FormAnimations';
import { getFormAttributes } from '@/components/utils';

import ErrorMessage from './inputs/ErrorMessage';
import FormInput from './inputs/FormInput';
import SubmitButton from './inputs/FormSubmitButton';

/**
 * Form-field flag helpers.
 *
 * Fields are routed into authData / formData / notificationData by the flags
 * configured in the OneEntry admin panel, NOT by hardcoded markers. Hoisted
 * to module scope so their reference is stable across renders (so hooks that
 * depend on them don't need to track them in their dependency arrays).
 */
type FormField = IAttributes & {
  isLogin?: boolean | null;
  isSignUp?: boolean | null;
  isNotificationEmail?: boolean | null;
  isNotificationPhoneSMS?: boolean | null;
  isNotificationPhonePush?: boolean | null;
};
const isPasswordField = (f: FormField): boolean =>
  (f.additionalFields as Record<string, { value?: string }> | undefined)?.type
    ?.value === 'password';
const isLoginCredential = (f: FormField): boolean =>
  f.isLogin === true || isPasswordField(f);

/**
 * SignUp form component for user registration
 *
 * This component renders a form that allows new users to register an account
 * using their email, name, phone number, and password. It handles form validation,
 * user registration logic, and provides appropriate feedback.
 * @param   {FormProps}        props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary object containing localized text values
 * @returns {JSX.Element}                 SignUp form JSX element
 */
const SignUpForm = ({ dict }: FormProps): JSX.Element => {
  /** State for managing loading status during form submission */
  const [loading, setLoading] = useState(false);
  /** State for storing error messages during form submission */
  const [error, setError] = useState('');

  /** Access authentication context to manage user authentication state */
  const { login } = useContext(AuthContext);
  /** Access drawer context to control drawer state and component display */
  const { setOpen, setComponent, setAction } = useContext(OpenDrawerContext);

  /** Extract localized text values from dictionary */
  const { sign_up_text, sign_in_text, create_account_desc } = dict;

  /** Get form configuration data by marker using RTK Query */
  const { data, isLoading } = useGetFormByMarkerQuery({ marker: 'reg' });

  /** Get current form field states from Redux store */
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /** All form attributes (unfiltered) from CMS. */
  const attributes = useMemo(() => getFormAttributes<FormField>(data), [data]);

  /**
   * Visible fields for the sign-up form: everything except pure-notification
   * fields. Fields with `isSignUp: true` override the visibility rule — they
   * are always shown, even when flagged as notification.
   */
  const visibleFields = useMemo(
    () =>
      attributes.filter((f) => {
        const isNotif =
          f.isNotificationEmail === true ||
          f.isNotificationPhoneSMS === true ||
          f.isNotificationPhonePush === true;
        const isPureNotification =
          isNotif && !isLoginCredential(f) && f.isSignUp !== true;
        return !isPureNotification;
      }),
    [attributes],
  );

  /** Determine if form can be submitted based on field validation */
  const canSubmit = useMemo(
    () => visibleFields.every((f) => fields[f.marker]?.valid),
    [fields, visibleFields],
  );

  /** Handle sign up form submission with authentication flow */
  const onSignUp = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!canSubmit) return;

      const value = (marker: string): string =>
        fields[marker]?.value?.toString().trim() || '';

      /**
       * Route each field into the correct bucket by its flag from the CMS:
       * - login/password  → authData (ONLY)
       * - everything else → formData (profile data; notification fields are included here as well)
       * - notification fields → notificationData (additionally)
       */
      const authData: IAuthPostBody['authData'] = attributes
        .filter(isLoginCredential)
        .filter((f) => value(f.marker))
        .map((f) => ({ marker: f.marker, value: value(f.marker) }));

      const formData = attributes
        .filter((f) => !isLoginCredential(f))
        .filter((f) => value(f.marker))
        .map((f) => ({
          marker: f.marker,
          type: (f.type as string) || 'string',
          value: value(f.marker),
        }));

      const loginField = attributes.find((f) => f.isLogin === true);
      const notifEmailField = attributes.find(
        (f) => f.isNotificationEmail === true,
      );
      const email =
        (notifEmailField && value(notifEmailField.marker)) ||
        (loginField && value(loginField.marker)) ||
        '';

      const pushField = attributes.find(
        (f) => f.isNotificationPhonePush === true,
      );
      const phonePush =
        pushField && value(pushField.marker) ? [value(pushField.marker)] : [];

      const smsField = attributes.find(
        (f) => f.isNotificationPhoneSMS === true,
      );
      const notificationData: ISignUpData['notificationData'] = {
        email,
        phonePush,
      };
      if (smsField && value(smsField.marker)) {
        notificationData.phoneSMS = value(smsField.marker);
      }

      const signUpBody: ISignUpData = {
        formIdentifier: 'reg',
        authData,
        formData,
        notificationData,
      };

      /** Set loading state to indicate form submission is in progress */
      setLoading(true);

      /** Attempt to register new user through API */
      try {
        /**
         * Call authentication provider to create new account (client-side
         * so the real browser fingerprint is sent).
         */
        const res = await getApi().AuthProvider.signUp('email', signUpBody);

        if (isError(res)) {
          setError(`Error ${res.statusCode}: ${res.message ?? ''}`.trim());
          return;
        }

        if (res?.isActive) {
          /**
           * Account is immediately active — sign the user in by calling
           * auth() directly (fingerprint stays real) and routing the tokens
           * through the AuthContext login() helper (uses syncTokens).
           */
          const passwordField = attributes.find(isPasswordField);
          const passwordValue = passwordField
            ? value(passwordField.marker)
            : '';
          const authResult = await getApi().AuthProvider.auth('email', {
            authData: [
              {
                marker: loginField?.marker ?? 'email_reg',
                value: res.identifier,
              },
              {
                marker: passwordField?.marker ?? 'password_reg',
                value: passwordValue,
              },
            ],
          });
          if (!isError(authResult)) {
            login({
              accessToken: authResult.accessToken,
              refreshToken: authResult.refreshToken,
              authProviderMarker: 'email',
            });
          }
          setOpen(false);
        } else {
          /** Account needs email/phone verification before first login. */
          setOpen(true);
          setComponent('VerificationForm');
          setAction('activateUser');
        }

        setError('');
      } catch (e) {
        /** Capture and display any errors that occur during registration */
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        /** Reset loading state after registration attempt completes */
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, attributes, canSubmit],
  );

  /* Render the complete sign up form UI */
  return (
    <FormAnimations className={''} isLoading={isLoading} isActive={true}>
      <form
        onSubmit={onSignUp}
        className="mx-auto flex min-h-full w-full max-w-107.5 flex-col gap-4 text-xl leading-5"
      >
        {/** Display sign in link and account creation description */}
        <div className="relative box-border flex shrink-0 flex-col gap-2.5">
          <p className="text-xs text-gray-400 max-md:max-w-full">
            {/** Button to switch to sign in form */}
            <button
              onClick={() => setComponent('SignInForm')}
              className="underline"
            >
              {sign_in_text?.value}
            </button>{' '}
            {/** Account creation description text */}
            {create_account_desc?.value}
          </p>
        </div>

        {/** Render dynamic form fields (visible per flag routing above). */}
        <div className="relative mb-4 box-border flex shrink-0 flex-col gap-4">
          {visibleFields.map((field, index) => (
            <FormInput key={field.marker} index={index} {...field} />
          ))}
        </div>
        {/** Render submit button for form submission */}
        <SubmitButton
          title={sign_up_text?.value}
          isLoading={loading || isLoading}
          index={10}
        />
        {/** Display error message if present */}
        {error && <ErrorMessage error={error} />}
      </form>
    </FormAnimations>
  );
};

export default SignUpForm;
