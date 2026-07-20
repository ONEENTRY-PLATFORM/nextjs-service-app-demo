/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type {
  IAuthData,
  IAuthFormData,
} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { FormEvent, JSX } from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import {
  getApi,
  isError as isSdkError,
  useGetFormByMarkerQuery,
} from '@/app/api';
import { useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import type { FormProps } from '@/app/types/global';
import { isConfirmPasswordField } from '@/components/forms/fieldFlags/isConfirmPasswordField';
import { isLoginCredential } from '@/components/forms/fieldFlags/isLoginCredential';
import { isPasswordField } from '@/components/forms/fieldFlags/isPasswordField';
import { getFormAttributes, sortArrayByPosition } from '@/components/utils';

import AuthError from '../pages/AuthError';
import SpinnerLoader from '../shared/SpinnerLoader';
import ErrorMessage from './inputs/ErrorMessage';
import FormInput from './inputs/FormInput';
import SubmitButton from './inputs/FormSubmitButton';
import ProfileCancelButton from './inputs/ProfileCancelButton';
import ProfileEditButton from './inputs/ProfileEditButton';
import ProfileFieldRow from './inputs/ProfileFieldRow';

/**
 * Type definition for input value
 */
export type InputValue = {
  value: string;
  valid: boolean;
  [key: string]: unknown;
};

/**
 * UserForm component renders a form for user profile management.
 * Allows authenticated users to update their personal information such as email, phone, and password.
 * @param   {FormProps}        props      - Component props
 * @param   {IAttributeValues} props.dict - Dictionary containing localized strings for form labels and messages
 * @returns {JSX.Element}                 User form component or authentication error if user is not authenticated
 */
const UserForm = ({ dict }: FormProps): JSX.Element => {
  const { isAuth, refreshUser, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isError, setError] = useState('');
  /**
   * The card opens read-only (mock `AccountPage.tsx`); the inputs only exist
   * while editing, so leaving the mode drops any unsaved typing with them.
   */
  const [isEditing, setEditing] = useState(false);

  /**
   * Get form by marker with RTK.
   *
   * The marker comes from the user's own `formIdentifier` rather than a
   * hardcoded `'reg'`: the profile form must be whichever form the account was
   * registered with. It matches `'reg'` today (the only registration form), so
   * this changes nothing now and stops being a guess if a second one appears.
   */
  const { data, isLoading, error } = useGetFormByMarkerQuery(
    { marker: user?.formIdentifier ?? '' },
    { skip: !user?.formIdentifier },
  );

  /** get fields from formFieldsReducer */
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /** Form fields sorted by position for a deterministic order. */
  const sortedFields = sortArrayByPosition(
    getFormAttributes<IFormAttribute>(data),
  );

  /**
   * Current trimmed value of a form field from the Redux store.
   * @param   {string} marker - Field marker
   * @returns {string}        Trimmed value, or an empty string when unset
   */
  const value = (marker: string): string =>
    fields[marker as keyof typeof fields]?.value?.toString().trim() || '';

  /**
   * Saved value of a field as the server holds it, used by the read-only rows.
   * `user.formData` is the server copy, so it stays the source of truth for the
   * view mode even after the Redux draft was edited and cancelled.
   *
   * The login e-mail lives outside `formData` — the account identifier is its
   * stored value. Passwords are never pre-filled: `isLogin` is checked
   * directly rather than through `isLoginCredential`, which also covers
   * password fields and would leak the identifier into them.
   * @param   {IFormAttribute} field - Form field from the CMS
   * @returns {string}               Stored value, or an empty string when unset
   */
  const storedValue = (field: IFormAttribute): string => {
    if (isPasswordField(field) || isConfirmPasswordField(field)) {
      return '';
    }
    if (field.isLogin === true) {
      return user?.identifier ?? '';
    }
    if (!Array.isArray(user?.formData)) {
      return '';
    }
    const stored = user.formData.find(
      (item) => item.marker === field.marker,
    ) as { value?: string } | undefined;
    return stored?.value ?? '';
  };

  /**
   * Fields shown as read-only rows: the mock lists personal data only, so
   * passwords (and the hidden notification email) never appear in view mode.
   */
  const viewFields = sortedFields.filter(
    (field) =>
      field.marker !== 'email_notification_reg' &&
      !isPasswordField(field) &&
      !isConfirmPasswordField(field),
  );

  /**
   * Fields rendered as inputs while editing. The login e-mail is excluded:
   * `updateUser` accepts a single `authData` entry (the password), so a changed
   * login could never be submitted — it is shown as a read-only row instead of
   * an input that silently discards typing.
   */
  const editFields = sortedFields.filter(
    (field) =>
      field.marker !== 'email_notification_reg' && field.isLogin !== true,
  );

  /** The login field, shown read-only inside the edit form. */
  const loginField = sortedFields.find((field) => field.isLogin === true);

  /**
   * Prepare profile form data for update. Fields are routed by their CMS flags,
   * NOT by marker name (mirrors SignUpForm):
   * - login/password credentials  → `authData` ONLY (never `formData`)
   * - repeat-password confirm      → not submitted at all
   * - notification-email field     → carried in `notificationData.email`
   * - everything else              → `formData`, empty values filtered out
   * (FormInput seeds Redux with `''`, which the API would reject as a 400).
   */
  const formData = sortedFields
    .filter(
      (field) =>
        field.marker !== 'email_notification_reg' &&
        !isLoginCredential(field) &&
        !isConfirmPasswordField(field),
    )
    .filter((field) => value(field.marker))
    .map((field) => ({
      marker: field.marker,
      value: value(field.marker),
      type: field.type || 'string',
    })) as IAuthFormData[];

  /**
   * Update user data
   * @param {FormEvent<HTMLFormElement>} e - form submit event
   */
  const onUpdateUserData = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /**
     * Email is required for the notification payload; the password is optional
     * — an empty password means "keep the current one", so it must NOT block
     * the save.
     */
    if (!fields.email_reg) {
      return;
    }
    /** Attempt to update user data */
    try {
      /** Set loading state during update process */
      setLoading(true);

      /**
       * Login credentials go into `authData` (routed by CMS flags, not marker
       * names), and the API takes them all-or-nothing: sending the login alone
       * fails with "Login or password values are missed". So credentials are
       * submitted only when a new password was typed — otherwise `authData`
       * stays empty, which means "keep the current credentials".
       *
       * Entries are `{marker, value}` only: unlike sign-up's `IAuthFormData`,
       * `updateUser` takes `IAuthData` and rejects a `type` key outright
       * (`"authData[0].type" is not allowed`).
       */
      const authData: IAuthData[] = sortedFields
        .filter(isPasswordField)
        .filter((field) => value(field.marker))
        .map((field) => ({
          marker: field.marker,
          value: value(field.marker),
        }));

      /** Update user information via API if form identifier exists */
      if (user?.formIdentifier) {
        const result = await getApi().Users.updateUser({
          formIdentifier: user.formIdentifier,
          formData,
          ...(authData.length > 0 ? { authData } : {}),
          notificationData: {
            email: fields.email_reg.value,
            phonePush: [],
            phoneSMS: fields.phone_reg?.value ?? '',
          },
          /**
           * Preserve the user's server state (cart, favorites) — sending `{}`
           * would wipe it. `updateUser` returns `boolean | IError`, so an API
           * failure is a value, not a thrown error: check it explicitly.
           */
          state: user.state,
        });
        if (isSdkError(result)) {
          setError(
            `Error ${result.statusCode}: ${result.message ?? ''}`.trim(),
          );
          return;
        }
      }

      /** Refresh user data after successful update */
      refreshUser();
      /** Clear any previous error messages */
      setError('');
      /** Saved — collapse the card back to its read-only rows */
      setEditing(false);
      /** Show success notification */
      toast('Data saved!');
    } catch (error) {
      /** Set error message if update fails */
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      /** Reset loading state after update attempt */
      setLoading(false);
    }
  };

  /** Show loading spinner while form data is being fetched */
  if (isLoading) {
    return <SpinnerLoader />;
  }

  /** Show authentication error if user is not authenticated or data is missing */
  if (!isAuth || error || !user?.formData) {
    return <AuthError dict={dict} />;
  }

  /** Read-only card: personal data rows and the Edit button (mock default) */
  if (!isEditing) {
    return (
      <div
        data-testid="profile-view"
        className="flex min-h-full w-full max-w-107.5 flex-col text-xl leading-5"
      >
        {viewFields.map((field: IFormAttribute, index: number) => (
          <ProfileFieldRow
            key={field.marker}
            index={index}
            label={field.localizeInfos?.title ?? field.marker}
            value={storedValue(field)}
          />
        ))}
        <div className="mt-5">
          <ProfileEditButton
            title={
              (dict?.edit_button_text?.value as string | undefined) || 'Edit'
            }
            onClick={() => setEditing(true)}
          />
        </div>
      </div>
    );
  }

  // Edit mode: the CMS-driven inputs with Save and Cancel
  return (
    <form
      data-testid="profile-form"
      className="flex min-h-full w-full max-w-107.5 flex-col gap-4 text-xl leading-5"
      onSubmit={onUpdateUserData}
    >
      {/** The login e-mail is not editable here — shown as a read-only row */}
      {loginField && (
        <ProfileFieldRow
          index={0}
          label={loginField.localizeInfos?.title ?? loginField.marker}
          value={storedValue(loginField)}
        />
      )}
      {/** Editable fields (personal data + password) */}
      <div className="relative mb-4 box-border flex shrink-0 flex-col gap-4">
        {editFields.map((field: IFormAttribute, index: number) => {
          /**
           * On sign-up the password is mandatory; in the profile it is not.
           * Leaving it empty omits `authData` entirely, which the API reads as
           * "keep the current password", so the CMS `isSignUpRequired` flag
           * must not block the save here.
           */
          const optionalPassword =
            isPasswordField(field) || isConfirmPasswordField(field);
          return (
            <FormInput
              key={field.marker}
              index={index + 1}
              {...field}
              isSignUpRequired={
                optionalPassword ? false : field.isSignUpRequired
              }
              value={storedValue(field)}
            />
          );
        })}
      </div>
      {/** Save + Cancel row (mock: gradient Save, bordered Cancel) */}
      <div className="flex items-stretch gap-2">
        <SubmitButton
          title={
            (dict?.save_button_text?.value as string | undefined) || 'Save'
          }
          isLoading={loading}
          index={10}
        />
        <ProfileCancelButton
          title={
            (dict?.cancel_button_text?.value as string | undefined) || 'Cancel'
          }
          onClick={() => setEditing(false)}
        />
      </div>
      {/** Display error message if present */}
      {isError && <ErrorMessage error={isError} />}
    </form>
  );
};

export default UserForm;
