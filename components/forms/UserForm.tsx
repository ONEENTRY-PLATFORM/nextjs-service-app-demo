/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { FormEvent, JSX } from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { getApi, isError as isSdkError } from '@/app/api/api/api';
import { AuthContext } from '@/app/store/providers/AuthContext';
import type { FormProps } from '@/app/types/global';
import { buildProfileUpdateBody } from '@/components/forms/buildProfileUpdateBody';
import { isConfirmPasswordField } from '@/components/forms/fieldFlags/isConfirmPasswordField';
import { isPasswordField } from '@/components/forms/fieldFlags/isPasswordField';
import { useCmsForm } from '@/components/forms/useCmsForm';
import { dictText } from '@/components/utils/dictText';
import { normalizeErrorMessage } from '@/components/utils/normalizeErrorMessage';
import { toErrorMessage } from '@/components/utils/toErrorMessage';

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
  const {
    attributes: sortedFields,
    fields,
    isLoading,
    error,
  } = useCmsForm(user?.formIdentifier ?? '');

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
   * Update user data
   * @param {FormEvent<HTMLFormElement>} e - form submit event
   */
  const onUpdateUserData = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /**
     * Email for the notification payload. It comes from the signed-in user, not
     * from the shared form-field bag: `editFields` deliberately hides `isLogin`
     * fields, so this form never writes `email_reg` itself. Reading only the bag
     * meant Save silently did nothing for anyone who had not just signed up in
     * the same tab — a guest returning after a reload, or anyone who signed in
     * with Google. The bag is still preferred so a just-typed value wins.
     *
     * The password stays optional — empty means "keep the current one" and must
     * NOT block the save.
     */
    const notificationEmail = fields.email_reg?.value || user?.identifier || '';
    if (!notificationEmail) {
      setError(
        dictText(
          dict,
          'err_no_email_on_file',
          'Your account has no e-mail on file — cannot save.',
        ),
      );
      return;
    }
    /** Attempt to update user data */
    try {
      /** Set loading state during update process */
      setLoading(true);

      /** Update user information via API if form identifier exists */
      if (user?.formIdentifier) {
        /**
         * The body is assembled by `buildProfileUpdateBody` (beside
         * `buildSignUpBody`): fields are bucketed by their CMS flags, `state` is
         * echoed back so cart / favorites survive, and `updateUser` returns
         * `boolean | IError` so an API failure is a value, checked below.
         */
        const result = await getApi().Users.updateUser(
          buildProfileUpdateBody({
            attributes: sortedFields,
            values: fields,
            formIdentifier: user.formIdentifier,
            email: notificationEmail,
            phoneSMS: fields.phone_reg?.value ?? '',
            state: user.state,
          }),
        );
        if (isSdkError(result)) {
          /** Validation 400s send `message` as a string ARRAY — normalize. */
          setError(
            `Error ${result.statusCode}: ${normalizeErrorMessage(result.message)}`.trim(),
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
      toast(dictText(dict, 'toast_data_saved', 'Data saved!'));
    } catch (error) {
      /** Set error message if update fails */
      setError(toErrorMessage(error));
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
            title={dictText(dict, 'edit_text', 'Edit')}
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
          title={dictText(dict, 'save_button_text', 'Save')}
          isLoading={loading}
          index={10}
        />
        <ProfileCancelButton
          title={dictText(dict, 'cancel_text', 'Cancel')}
          onClick={() => setEditing(false)}
        />
      </div>
      {/** Display error message if present */}
      {isError && <ErrorMessage error={isError} />}
    </form>
  );
};

export default UserForm;
