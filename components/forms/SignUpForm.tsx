/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type {
  IAuthPostBody,
  ISignUpData,
} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { FormEvent, JSX } from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';

import {
  getApi,
  useGetAuthProvidersQuery,
  useGetFormByMarkerQuery,
} from '@/app/api';
import { isError } from '@/app/api';
import { useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import type { FormProps } from '@/app/types/global';
import FormAnimations from '@/components/forms/animations/FormAnimations';
import { isConfirmPasswordField } from '@/components/forms/fieldFlags/isConfirmPasswordField';
import { isLoginCredential } from '@/components/forms/fieldFlags/isLoginCredential';
import { isPasswordField } from '@/components/forms/fieldFlags/isPasswordField';
import { getFormAttributes, sortArrayByPosition } from '@/components/utils';

import AuthDivider from './inputs/AuthDivider';
import ErrorMessage from './inputs/ErrorMessage';
import FormInput from './inputs/FormInput';
import SubmitButton from './inputs/FormSubmitButton';
import GoogleSignInButton from './inputs/GoogleSignInButton';

/**
 * A single form field, as the SDK's forms API describes it.
 *
 * `IFormAttribute` — not `IAttributes` from `base/utils`: the former is the type
 * for FORM fields and already declares the auth/notification flags this file
 * routes on (`isLogin`, `isPassword`, `isSignUpRequired`, `isNotification*`),
 * which `IAttributes` lacks entirely. They used to be bolted on by hand here,
 * duplicating the SDK.
 */
type FormField = IFormAttribute;

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
  /** Terms & Privacy consent (mock's required checkbox) */
  const [agree, setAgree] = useState(false);

  /** Access authentication context to manage user authentication state */
  const { login } = useContext(AuthContext);
  /** Access drawer context to control drawer state and component display */
  const { setOpen, setComponent, setAction, setDirection } =
    useContext(OpenDrawerContext);

  /** Extract localized text values from dictionary */
  const { sign_up_text, sign_in_text, create_account_desc } = dict;

  /** Get form configuration data by marker using RTK Query */
  const { data, isLoading } = useGetFormByMarkerQuery({ marker: 'reg' });

  /** Get current form field states from Redux store */
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /**
   * The registration provider marker and its `formIdentifier` come from the
   * CMS auth providers, not hardcoded (skill:create-auth). The credential
   * (non-OAuth) provider drives sign-up; fall back to `email`/`reg` — the
   * current CMS values — while the query loads or when the field is unset.
   */
  const { data: authProviders } = useGetAuthProvidersQuery('en_US');
  const credentialProvider = useMemo(
    () => (authProviders ?? []).find((provider) => provider.type !== 'oauth'),
    [authProviders],
  );
  const providerMarker = credentialProvider?.identifier ?? 'email';
  const signUpFormIdentifier = credentialProvider?.formIdentifier ?? 'reg';

  /** All form attributes (unfiltered) from CMS, ordered by field position. */
  const attributes = useMemo(
    () => sortArrayByPosition(getFormAttributes<FormField>(data)),
    [data],
  );

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
          isNotif &&
          !isLoginCredential(f) &&
          f.isSignUp !== true &&
          f.isSignUpRequired !== true;
        return !isPureNotification;
      }),
    [attributes],
  );

  /** Determine if form can be submitted based on field validation + consent */
  const canSubmit = useMemo(
    () => agree && visibleFields.every((f) => fields[f.marker]?.valid),
    [agree, fields, visibleFields],
  );

  /**
   * First/last-name field pair for the mock's two-column row
   * (`grid lg:grid-cols-2`). Only adjacent fields are paired so the CMS field
   * order stays authoritative; any other layout renders single-column.
   */
  const namePair = useMemo(() => {
    const nameIdx = visibleFields.findIndex((f) =>
      /^(first_?)?name/i.test(f.marker),
    );
    const surnameIdx = visibleFields.findIndex((f) =>
      /^(sur|last_?)name/i.test(f.marker),
    );
    return nameIdx >= 0 && surnameIdx === nameIdx + 1 ? nameIdx : -1;
  }, [visibleFields]);

  /** Handle sign up form submission with authentication flow */
  const onSignUp = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!canSubmit) return;

      const value = (marker: string): string =>
        fields[marker]?.value?.toString().trim() || '';

      const passwordField = attributes.find(isPasswordField);
      const confirmField = attributes.find(isConfirmPasswordField);
      if (
        passwordField &&
        confirmField &&
        value(passwordField.marker) !== value(confirmField.marker)
      ) {
        setError('Passwords do not match');
        return;
      }

      /**
       * Route each field into the correct bucket by its flag from the CMS:
       * - login/password  → authData (ONLY)
       * - repeat password → nowhere (client-side match check above)
       * - everything else → formData (profile data; notification fields are included here as well)
       * - notification fields → notificationData (additionally)
       */
      const authData: IAuthPostBody['authData'] = attributes
        .filter(isLoginCredential)
        .filter((f) => value(f.marker))
        .map((f) => ({ marker: f.marker, value: value(f.marker) }));

      const formData = attributes
        .filter((f) => !isLoginCredential(f) && !isConfirmPasswordField(f))
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
        formIdentifier: signUpFormIdentifier,
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
        const res = await getApi().AuthProvider.signUp(
          providerMarker,
          signUpBody,
        );

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
          const passwordValue = passwordField
            ? value(passwordField.marker)
            : '';
          const authResult = await getApi().AuthProvider.auth(providerMarker, {
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
              authProviderMarker: providerMarker,
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
    [
      fields,
      attributes,
      canSubmit,
      login,
      setOpen,
      setComponent,
      setAction,
      providerMarker,
      signUpFormIdentifier,
    ],
  );

  /* Render the complete sign up form UI */
  return (
    <FormAnimations className={''} isLoading={isLoading} isActive={true}>
      <form
        onSubmit={onSignUp}
        data-testid="auth-form-sign-up"
        className="mx-auto flex min-h-full w-full max-w-107.5 flex-col gap-4 text-xl leading-5"
      >
        {/**
            Render dynamic form fields (visible per flag routing above);
            first/last name share a two-column row on lg, as in the mock.
          */}
        <div className="relative mb-4 box-border flex shrink-0 flex-col gap-4">
          {visibleFields.map((field, index) => {
            if (namePair >= 0 && index === namePair + 1) {
              /** Rendered inside the pair row below */
              return null;
            }
            if (namePair >= 0 && index === namePair) {
              const surnameField = visibleFields[index + 1];
              return (
                <div
                  key={field.marker}
                  className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                >
                  <FormInput index={index} {...field} />
                  {surnameField && (
                    <FormInput index={index + 1} {...surnameField} />
                  )}
                </div>
              );
            }
            return <FormInput key={field.marker} index={index} {...field} />;
          })}
        </div>
        {/** Terms & Privacy consent — required, as in the mock */}
        <label className="flex cursor-pointer items-start gap-2.5 select-none">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-fuchsia-500"
          />
          <span className="text-sm leading-relaxed text-neutral-300">
            I agree to the{' '}
            <span className="font-semibold text-fuchsia-500 underline">
              Terms
            </span>
            {' & '}
            <span className="font-semibold text-fuchsia-500 underline">
              Privacy Policy
            </span>
          </span>
        </label>
        {/** Render submit button for form submission */}
        <SubmitButton
          title={sign_up_text?.value}
          isLoading={loading || isLoading}
          index={10}
        />
        {/** OAuth alternative: divider + Google sign-in (works for sign-up too) */}
        <div className="flex w-full flex-col gap-3">
          <AuthDivider />
          <GoogleSignInButton />
        </div>
        {/** Switch back to sign-in — at the bottom of the form, as in the mock */}
        <p className="w-full text-center text-sm text-neutral-300">
          {(create_account_desc?.value as string | undefined) ||
            'Already have an account?'}{' '}
          {/** Button to switch to sign in form (backward step: slide from left) */}
          <button
            onClick={() => {
              setDirection('backward');
              setComponent('SignInForm');
            }}
            className="font-semibold text-fuchsia-500"
          >
            {(sign_in_text?.value as string | undefined) || 'Sign In'}
          </button>
        </p>
        {/** Display error message if present */}
        {error && <ErrorMessage error={error} />}
      </form>
    </FormAnimations>
  );
};

export default SignUpForm;
