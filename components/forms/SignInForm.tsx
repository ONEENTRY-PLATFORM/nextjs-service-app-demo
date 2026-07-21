'use client';

import type { IAuthPostBody } from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { FormEvent, JSX } from 'react';
import { useContext, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { getApi, isError } from '@/app/api/api/api';
import {
  useGetAuthProvidersQuery,
  useGetFormByMarkerQuery,
} from '@/app/api/api/RTKApi';
import { useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import FormAnimations from '@/components/forms/animations/FormAnimations';
import FormFieldAnimations from '@/components/forms/animations/FormFieldAnimations';
import { getFormAttributes } from '@/components/utils/getFormAttributes';

import AuthDivider from './inputs/AuthDivider';
import CreateAccountButton from './inputs/CreateAccountButton';
import ErrorMessage from './inputs/ErrorMessage';
import FormInput from './inputs/FormInput';
import FormSubmitButton from './inputs/FormSubmitButton';
import GoogleSignInButton from './inputs/GoogleSignInButton';
import ResetPasswordButton from './inputs/ResetPasswordButton';

/**
 * Sign In form component for user authentication
 *
 * This component renders a form that allows users to sign in using either
 * email or phone number along with their password. It handles form validation,
 * authentication logic, and provides user feedback.
 * @param   {object}           props           - Component properties
 * @param   {IAttributeValues} props.dict      - Dictionary object containing localized text values
 * @param   {string}           props.className - CSS classes to apply to the form container
 * @param   {boolean}          props.isActive  - Flag indicating if the form is currently active/visible
 * @returns {JSX.Element}                      The rendered Sign In form component
 */
const SignInForm = ({
  dict,
  className,
  isActive,
}: {
  dict: IAttributeValues;
  className: string;
  isActive: boolean;
}): JSX.Element => {
  /** Access authentication context to manage user authentication state */
  const { login } = useContext(AuthContext);
  /** Access drawer context to control drawer open state */
  const { setOpen } = useContext(OpenDrawerContext);

  /** State for managing active tab (email or phone) */
  const [tab, setTab] = useState('email');
  /** Loading state for authentication process */
  const [loading, setLoading] = useState(false);
  /** Error state for displaying authentication errors */
  const [error, setError] = useState('');

  /** Extract localized text values from dictionary */
  const {
    reset_password_text,
    forgot_password_text,
    create_account_text,
    sign_in_text,
  } = dict;

  /** Get form by marker with RTK Query */
  const { data, isLoading } = useGetFormByMarkerQuery({ marker: 'reg' });

  /** Get form field values from Redux store */
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /** Sort form fields by their position property */
  const formFields = useMemo(
    () =>
      getFormAttributes(data).sort(
        (a: { position: number }, b: { position: number }) =>
          a.position - b.position,
      ),
    [data],
  );

  /**
   * Credentials for sign-in are selected by the CMS flags `isLogin` /
   * `isPassword`, NOT by marker name — the login (email) field and the
   * password field. Profile-only fields like `phone_reg` (no flags) are
   * excluded even though their marker looks like `${tab}_reg`.
   */
  const credentialFields = useMemo(
    () =>
      formFields.filter(
        (f: IFormAttribute) => f.isLogin === true || f.isPassword === true,
      ),
    [formFields],
  );

  /**
   * Sign-in tabs are the credential (non-OAuth) providers configured in the
   * CMS — do not hardcode them. Hardcoding `'phone'` broke the tab: no such
   * provider exists, so `auth('phone', …)` failed. OAuth providers (Google)
   * are handled by a separate button. Fall back to `email` while loading.
   */
  const { data: authProviders } = useGetAuthProvidersQuery('en_US');
  const tabs = useMemo(() => {
    const credential = (authProviders ?? [])
      .filter((provider) => provider.type !== 'oauth')
      .map((provider) => provider.identifier);
    return credential.length > 0 ? credential : ['email'];
  }, [authProviders]);

  /**
   * Handle sign in form submission
   *
   * This function handles the authentication process when the user submits the form.
   * It validates the input fields, calls the authentication API, and manages the
   * application state based on the result.
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   */
  const onSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /**
     * Build authData from the flagged credential fields, dropping empty
     * values — FormInput seeds Redux with `value: ''` on mount, and the SDK
     * rejects an empty string with a 400.
     */
    const authData: IAuthPostBody['authData'] = credentialFields
      .map((field) => ({
        marker: field.marker,
        value: fields[field.marker]?.value?.toString().trim() ?? '',
      }))
      .filter((entry) => entry.value !== '');

    /** Every credential field must be filled before submission */
    if (authData.length < credentialFields.length) return;

    /** Attempt user authentication */
    try {
      /** Set loading state during authentication process */
      setLoading(true);

      /**
       * Call AuthProvider.auth directly from the Client Component.
       * This is required so the SDK captures the real browser device
       * fingerprint — running it through a Server Action would set
       * deviceInfo.browser to "Node.js/..." instead.
       */
      const body: IAuthPostBody = { authData };
      const result = await getApi().AuthProvider.auth(tab, body);

      if (isError(result)) {
        throw new Error(result.message || 'Authentication failed');
      }

      /** Write tokens into the current SDK instance and fetch the user. */
      login({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        authProviderMarker: tab,
      });

      /** Close drawer after successful authentication */
      setOpen(false);
      /** Clear any previous error messages */
      setError('');
      /** Show success notification */
      toast('You signed in!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      /** Reset loading state after authentication attempt */
      setLoading(false);
    }
  };

  /** Render sign in form with email/phone tabs and form fields */
  return (
    <FormAnimations
      isLoading={isLoading || !data}
      className={className}
      isActive={isActive}
    >
      <form
        data-testid="auth-form-sign-in"
        className="relative mx-auto mt-2 mb-6 box-border flex shrink-0 flex-col gap-3"
        onSubmit={onSignIn}
      >
        {/* Provider tabs only make sense with more than one credential
         * provider. With a single provider (the current CMS `email`) they add
         * a lone dead button — the static-html AuthModal has no tabs — so hide
         * the row and drive `auth()` with the single `tab` value.
         */}
        {tabs.length > 1 && (
          <div className="relative box-border flex shrink-0 flex-col gap-2.5">
            <FormFieldAnimations
              index={1}
              className="max-w-full text-xs text-gray-400"
            >
              {tabs.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTab(type)}
                  className={tab === type ? 'font-bold' : ''}
                >
                  {(dict[`${type}_text`]?.value as string | undefined) ?? type}
                </button>
              ))}
            </FormFieldAnimations>
          </div>
        )}

        {/** Render the flagged credential fields (login + password) */}
        <div className="relative mb-4 box-border flex shrink-0 flex-col gap-4">
          {credentialFields.map((field: IFormAttribute, index: number) => (
            <FormInput key={field.marker} index={index + 2} {...field} />
          ))}
        </div>

        {/** Render sign in submit button */}
        <FormSubmitButton
          index={5}
          title={(sign_in_text?.value as string | undefined) ?? ''}
          isLoading={loading}
        />

        {/** OAuth alternative: divider + Google sign-in (full-page redirect) */}
        <FormFieldAnimations index={6} className="flex w-full flex-col gap-3">
          <AuthDivider />
          <GoogleSignInButton />
        </FormFieldAnimations>

        {/** Render forgot password section with reset button */}
        <FormFieldAnimations
          index={7}
          className="mx-auto mb-4 flex justify-between gap-5"
        >
          <div className="w-auto basis-auto text-md text-gray-400 transition-colors duration-300 hover:text-cyan-400">
            {forgot_password_text?.value as string | undefined}
          </div>
          <ResetPasswordButton
            title={(reset_password_text?.value as string | undefined) ?? ''}
          />
        </FormFieldAnimations>

        {/** Render create account button */}
        <FormFieldAnimations index={8} className="w-full">
          <CreateAccountButton
            title={(create_account_text?.value as string | undefined) ?? ''}
          />
        </FormFieldAnimations>

        {error && <ErrorMessage error={error} />}
      </form>
    </FormAnimations>
  );
};

export default SignInForm;
