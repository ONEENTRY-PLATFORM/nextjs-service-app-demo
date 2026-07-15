/* eslint-disable jsdoc/no-undefined-types */
'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { FormEvent, JSX } from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';

import { getApi, isError, useGetAuthProvidersQuery } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { addField } from '@/app/store/reducers/FormFieldsSlice';
import type { FormProps } from '@/app/types/global';
import FormAnimations from '@/components/forms/animations/FormAnimations';
import {
  EVENT_RESET_GENERATE,
  EVENT_RESET_VERIFY,
} from '@/components/forms/authEventMarkers';

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
  /** Seconds left before the OTP can be resent (from the provider config) */
  const [cooldown, setCooldown] = useState(0);

  /**
   * OTP length and resend cooldown come from the `email` provider config
   * (`systemCodeLength` / `systemCodeTlsSec`) — do not hardcode them.
   * Fall back to the CMS defaults while the providers query is loading.
   */
  const { data: authProviders } = useGetAuthProvidersQuery('en_US');
  const emailProvider = authProviders?.find((p) => p.identifier === 'email');
  const codeLength = Number(emailProvider?.config?.systemCodeLength) || 8;
  const resendCooldownSec =
    Number(emailProvider?.config?.systemCodeTlsSec) || 120;

  /** Extract localized strings from dictionary */
  const { enter_otp_code, resend_text, receive_otp_text, verify_now_text } =
    dict;
  /** Get form fields from Redux store */
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /** Tick the resend cooldown down to zero */
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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
        /**
         * Verify the OTP for password reset. `checkCode` returns
         * `boolean | IError` — an API failure is a value, not a throw, and a
         * wrong code is `false`. Check both, or the truthy IError would be
         * treated as success.
         */
        const result = await getApi().AuthProvider.checkCode(
          'email',
          fields.email_reg.value,
          EVENT_RESET_VERIFY,
          otp,
        );
        if (isError(result)) {
          throw new Error(result.message || 'Verification failed');
        }
        if (!result) {
          throw new Error('Invalid verification code');
        }
        /** Switch to reset password form so the user can set a new password */
        setComponent('ResetPasswordForm');
      }
      // Handle user activation flow (when a new user is registering)
      else {
        /**
         * Activate the user account with the provided OTP. Same `boolean |
         * IError` contract as `checkCode`.
         */
        const result = await getApi().AuthProvider.activateUser(
          'email',
          fields.email_reg.value,
          otp,
        );
        if (isError(result)) {
          throw new Error(result.message || 'Activation failed');
        }
        if (!result) {
          throw new Error('Invalid verification code');
        }

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
  }, [
    fields.email_reg,
    fields.password_reg,
    otp,
    action,
    login,
    router,
    setComponent,
    setOpen,
  ]);

  /**
   * Handle form submission
   * Validates OTP length and triggers verification process
   */
  const onSubmitHandle = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      /** Only proceed once the OTP is complete (length from provider config) */
      if (otp.length === codeLength) {
        setLoading(true);
        setError('');
        await handleVerification();
      }
    },
    [otp, codeLength, handleVerification],
  );

  /**
   * Handle OTP resend request
   * Generates and sends a new OTP to the user's email
   */
  const onResendHandle = useCallback(async () => {
    /** Ensure email field is present and the cooldown has elapsed */
    if (!fields.email_reg || cooldown > 0) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      /**
       * Generate and send a new OTP. `generateCode` returns `boolean | IError`
       * — check it so a failed resend surfaces instead of silently starting
       * the cooldown.
       */
      const result = await getApi().AuthProvider.generateCode(
        'email',
        fields.email_reg.value,
        EVENT_RESET_GENERATE,
      );
      if (isError(result)) {
        throw new Error(result.message || 'Could not resend the code');
      }
      /** Block repeat resends for the provider's code TTL */
      setCooldown(resendCooldownSec);
    } catch (e) {
      /** Handle any errors during resend */
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      /** Always stop loading state */
      setLoading(false);
    }
  }, [fields.email_reg, cooldown, resendCooldownSec]);

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
            numInputs={codeLength}
            renderInput={(props) => <input {...props} />}
            containerStyle={{
              display: 'grid',
              gridTemplateColumns: `repeat(${codeLength}, minmax(0, 1fr))`,
              gap: '0.5rem',
              maxWidth: '100%',
            }}
            inputStyle="relative box-border flex h-[70px] min-w-[14%] flex-col rounded border border-solid border-neutral-100 bg-neutral-100 p-2.5 text-center text-2xl font-medium text-neutral-600"
          />
          {/* Resend OTP section */}
          <div className="self-end text-xs text-fuchsia-500 max-md:mr-2.5">
            <span className="text-gray-400">{receive_otp_text?.value} </span>
            <button
              className="font-bold text-fuchsia-500 disabled:opacity-50"
              type="button"
              onClick={onResendHandle}
              disabled={cooldown > 0}
            >
              {resend_text?.value}
              {cooldown > 0 ? ` (${cooldown}s)` : ''}
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
