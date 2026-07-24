/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type { FormEvent, JSX } from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';

import { getApi, isError } from '@/app/api/api/api';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import type { FormProps } from '@/app/types/global';
import FormAnimations from '@/components/forms/animations/FormAnimations';
import { buildSignUpBody } from '@/components/forms/buildSignUpBody';
import { isConfirmPasswordField } from '@/components/forms/fieldFlags/isConfirmPasswordField';
import { isPasswordField } from '@/components/forms/fieldFlags/isPasswordField';
import { isSignUpVisibleField } from '@/components/forms/fieldFlags/isSignUpVisibleField';
import { useCmsForm } from '@/components/forms/useCmsForm';
import { useCredentialProvider } from '@/components/forms/useCredentialProvider';
import { toErrorMessage } from '@/components/utils/toErrorMessage';

import AuthDivider from './inputs/AuthDivider';
import ErrorMessage from './inputs/ErrorMessage';
import SubmitButton from './inputs/FormSubmitButton';
import GoogleSignInButton from './inputs/GoogleSignInButton';
import SignUpFields from './inputs/SignUpFields';
import TermsConsent from './inputs/TermsConsent';

/**
 * SignUp form component for user registration
 *
 * This component renders a form that allows new users to register an account
 * using their email, name, phone number, and password. It handles form validation,
 * user registration logic, and provides appropriate feedback.
 *
 * The request body is assembled by {@link buildSignUpBody} — which bucket each
 * field lands in is decided by its CMS flags, not by its marker name.
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
  const {
    sign_up_text,
    sign_in_text,
    create_account_desc,
    err_passwords_no_match,
  } = dict;

  /** CMS form definition (ordered fields) plus the live values */
  const { attributes, fields, isLoading } = useCmsForm('reg');

  /**
   * The registration provider marker and its `formIdentifier` come from the
   * CMS auth providers, not hardcoded (skill:create-auth). The credential
   * (non-OAuth) provider drives sign-up; fall back to `email`/`reg` — the
   * current CMS values — while the query loads or when the field is unset.
   */
  const { marker: providerMarker, formIdentifier: signUpFormIdentifier } =
    useCredentialProvider();

  /** Fields the sign-up form renders — pure notification fields are dropped */
  const visibleFields = useMemo(
    () => attributes.filter(isSignUpVisibleField),
    [attributes],
  );

  /** Determine if form can be submitted based on field validation + consent */
  const canSubmit = useMemo(
    () => agree && visibleFields.every((f) => fields[f.marker]?.valid),
    [agree, fields, visibleFields],
  );

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
        setError(
          (err_passwords_no_match?.value as string | undefined) ||
            'Passwords do not match',
        );
        return;
      }

      const signUpBody = buildSignUpBody({
        attributes,
        values: fields,
        formIdentifier: signUpFormIdentifier,
      });

      /** Set loading state to indicate form submission is in progress */
      setLoading(true);

      /** Attempt to register new user through API */
      try {
        /* Call authentication provider to create new account */
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
          const loginField = attributes.find((f) => f.isLogin === true);
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
        setError(toErrorMessage(e));
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
      err_passwords_no_match,
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
        <SignUpFields fields={visibleFields} />
        <TermsConsent checked={agree} onChange={setAgree} />
        {/** Render submit button for form submission */}
        <SubmitButton
          title={(sign_up_text?.value as string | undefined) ?? ''}
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
