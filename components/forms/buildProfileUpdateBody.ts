import type { IAuthData } from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { IUserBody } from 'oneentry/dist/users/usersInterfaces';

import { isConfirmPasswordField } from '@/components/forms/fieldFlags/isConfirmPasswordField';
import { isLoginCredential } from '@/components/forms/fieldFlags/isLoginCredential';
import { isPasswordField } from '@/components/forms/fieldFlags/isPasswordField';

/** Live values of the form, keyed by field marker (`FormFieldsSlice`). */
export type ProfileValues = Record<
  string,
  { value: string; valid: boolean } | undefined
>;

/**
 * buildProfileUpdateBody — assemble the `Users.updateUser` body, the profile
 * counterpart of {@link buildSignUpBody}.
 *
 * Fields are routed by their CMS flags, NOT by marker name:
 * - login / password credentials → `authData` **only**, and all-or-nothing: the
 * API rejects a login without its password ("Login or password values are
 * missed"), so credentials are sent only when a new password was typed —
 * otherwise `authData` is omitted, which means "keep the current credentials".
 * Entries are `{ marker, value }` with NO `type` key: unlike sign-up's
 * `IAuthFormData`, `updateUser` takes `IAuthData` and rejects a `type`
 * (`"authData[0].type" is not allowed`).
 * - repeat-password confirm → nowhere;
 * - the notification-email field → carried in `notificationData.email` (its
 * value is passed in from the signed-in user, since the edit form hides it);
 * - everything else → `formData`, empty values dropped (`FormInput` seeds Redux
 * with `''`, which the API would reject as a 400).
 *
 * `phoneSMS` is always sent, even empty — deliberately unlike sign-up, which
 * omits it. `state` is echoed back untouched so the user's cart / favorites are
 * not wiped by an empty object.
 * @param   {object}           input                - Input
 * @param   {IFormAttribute[]} input.attributes     - All CMS fields of the profile form
 * @param   {ProfileValues}    input.values         - Live values keyed by marker
 * @param   {string}           input.formIdentifier - `formIdentifier` of the user's registration form
 * @param   {string}           input.email          - Notification e-mail (from the signed-in user)
 * @param   {string}           input.phoneSMS       - Notification SMS phone (may be empty)
 * @param   {object}           [input.state]        - The user's server state, echoed back
 * @returns {IUserBody}                             Request body for `Users.updateUser`
 */
export const buildProfileUpdateBody = ({
  attributes,
  values,
  formIdentifier,
  email,
  phoneSMS,
  state,
}: {
  attributes: IFormAttribute[];
  values: ProfileValues;
  formIdentifier: string;
  email: string;
  phoneSMS: string;
  state?: IUserBody['state'];
}): IUserBody => {
  /**
   * Trimmed value of one field — every bucket filters on truthiness, so a
   * whitespace-only entry reads as empty.
   * @param   {string} marker - Field marker
   * @returns {string}        Trimmed value, or `''`
   */
  const value = (marker: string): string =>
    values[marker]?.value?.toString().trim() || '';

  const formData = attributes
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
      type: (field.type as string) || 'string',
    }));

  const authData: IAuthData[] = attributes
    .filter(isPasswordField)
    .filter((field) => value(field.marker))
    .map((field) => ({ marker: field.marker, value: value(field.marker) }));

  return {
    formIdentifier,
    formData,
    ...(authData.length > 0 ? { authData } : {}),
    notificationData: { email, phonePush: [], phoneSMS },
    ...(state ? { state } : {}),
  };
};
