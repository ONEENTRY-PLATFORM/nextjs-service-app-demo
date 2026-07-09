/* eslint-disable jsdoc/no-undefined-types */
'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { FormEvent, JSX } from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { addField } from '@/app/store/reducers/FormFieldsSlice';
import type { FormProps } from '@/app/types/global';
import FormAnimations from '@/components/forms/animations/FormAnimations';

import ErrorMessage from './inputs/ErrorMessage';
import FormSubmitButton from './inputs/FormSubmitButton';

/**
 * VerificationForm component renders a form for OTP verification.
 * It handles both user activation and password reset verification flows.
 * @param   {FormProps}        props      - Component props
 * @param   {IAttributeValues} props.dict - Dictionary containing localized strings for form labels and messages
 * @returns {JSX.Element}                 JSX element for verification form
 */
const VerificationForm = ({ dict }: FormProps): JSX.Element => {
  /** Router for navigation with transitions */
  const router = useTransitionRouter();
  /** Redux dispatch function for updating state */
  const dispatch = useAppDispatch();
  /** Authentication context for managing user authentication state */
  const { login } = useContext(AuthContext);
  /** Context for managing the open drawer and its components */
  const { setOpen, setComponent, action } = useContext(OpenDrawerContext);

  /** State variables for managing form state */
  const [isLoading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  /** Extract localized strings from dictionary */
  const { enter_otp_code, resend_text, receive_otp_text, verify_now_text } =
    dict;
  /** Get form fields from Redux store */
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /** Update Redux store when OTP value changes */
  useEffect(() => {
    if (otp) {
      dispatch(addField({ otp_code: { valid: true, value: otp } }));
    }
  }, [otp, dispatch]);

  /**
   * Handle the verification process based on the current action
   * Can be either user activation or password reset verification
   */
  const handleVerification = useCallback(async () => {
    /** Ensure required fields are present before proceeding */
    if (!fields.email_reg || !fields.password_reg) {
      return;
    }

    try {
      /** Handle password reset verification flow */
      if (action !== 'activateUser') {
        /** Verify the OTP code sent to user's email for password reset */
        /** This checks if the provided OTP code matches the one sent to the user */
        const result = await getApi().AuthProvider.checkCode(
          'email',
          fields.email_reg.value,
          'otp',
          otp,
        );
        /**
         * If verification is successful, switch to reset password form
         * This allows the user to enter a new password
         */
        if (result) setComponent('ResetPasswordForm');
      }
      // Handle user activation flow (when a new user is registering)
      else {
        /**
         * Activate the user account with the provided OTP code
         * This confirms the user's email address and activates their account
         */
        const result = await getApi().AuthProvider.activateUser(
          'email',
          fields.email_reg.value,
          otp,
        );

        if (result) {
          /**
           * Log in the user after successful activation.
           * `getApi().AuthProvider.auth` is called directly (Client Component)
           * so the SDK captures the real browser fingerprint; tokens are
           * then routed through AuthContext.login() which uses syncTokens.
           */
          const authResult = await getApi().AuthProvider.auth('email', {
            authData: [
              { marker: 'email_reg', value: fields.email_reg.value },
              { marker: 'password_reg', value: fields.password_reg.value },
            ],
          });
          if (isError(authResult)) {
            throw new Error(authResult.message || 'Sign-in failed');
          }
          login({
            accessToken: authResult.accessToken,
            refreshToken: authResult.refreshToken,
            authProviderMarker: 'email',
          });

          /** Navigate to profile page after successful activation. */
          router.push('/profile');

          /** Close the drawer/modal after successful registration. */
          setOpen(false);
        } else {
          /** Throw an error if activation was not successful */
          /** This will be caught by the catch block below */
          throw new Error('Activation failed');
        }
      }
    } catch (e) {
      /** Handle any errors during verification */
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      /**
       * Always stop loading state regardless of success or failure
       * This ensures the UI is responsive after the operation
       */
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.email_reg, fields.password_reg]);

  /**
   * Handle form submission
   * Validates OTP length and triggers verification process
   */
  const onSubmitHandle = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      /** Only proceed if OTP is complete (6 digits) */
      if (otp.length === 6) {
        setLoading(true);
        setError('');
        await handleVerification();
      }
    },
    [otp, handleVerification],
  );

  /**
   * Handle OTP resend request
   * Generates and sends a new OTP to the user's email
   */
  const onResendHandle = useCallback(async () => {
    /** Ensure email field is present */
    if (!fields.email_reg) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      /** Generate and send new OTP code */
      await getApi().AuthProvider.generateCode(
        'email',
        fields.email_reg.value,
        'generate_code',
      );
    } catch (e) {
      /** Handle any errors during resend */
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      /** Always stop loading state */
      setLoading(false);
    }
  }, [fields.email_reg]);

  return (
    <FormAnimations className={''} isLoading={isLoading} isActive={true}>
      <form
        className="mx-auto flex min-h-full w-full max-w-107.5 flex-col gap-4 text-xl leading-5"
        onSubmit={onSubmitHandle}
      >
        {/* OTP instruction text */}
        <div className="relative mb-5 box-border flex shrink-0 flex-col gap-2.5">
          <p className="text-xs text-gray-400 max-md:max-w-full">
            {enter_otp_code?.value}
          </p>
        </div>

        {/* OTP input field and resend button */}
        <div className="relative mb-8 box-border flex shrink-0 flex-col gap-6">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderInput={(props) => <input {...props} />}
            containerStyle="grid max-w-full grid-cols-6 justify-between gap-2 max-md:gap-2"
            inputStyle="relative box-border flex h-[70px] min-w-[14%] flex-col rounded border border-solid border-neutral-100 bg-neutral-100 p-2.5 text-center text-2xl font-medium text-neutral-600"
          />
          {/* Resend OTP section */}
          <div className="self-end text-xs text-fuchsia-500 max-md:mr-2.5">
            <span className="text-gray-400">{receive_otp_text?.value} </span>
            <button
              className="font-bold text-fuchsia-500"
              type="button"
              onClick={onResendHandle}
            >
              {resend_text?.value}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <FormSubmitButton
          title={verify_now_text?.value}
          isLoading={isLoading}
          index={0}
        />
        {/* Error message display */}
        {error && <ErrorMessage error={error} />}
      </form>
    </FormAnimations>
  );
};

export default VerificationForm;
