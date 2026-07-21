import type {
  IAuthFormData,
  ISignUpData,
} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';

import { isConfirmPasswordField } from '@/components/forms/fieldFlags/isConfirmPasswordField';
import { isLoginCredential } from '@/components/forms/fieldFlags/isLoginCredential';

/**
 * The sign-up request body.
 *
 * Narrows the SDK's `formData`, declared as `IAuthFormData | IAuthFormData[]`,
 * to the array this builder always produces — so callers and tests can map over
 * it without re-narrowing.
 */
export interface SignUpBody extends ISignUpData {
  formData: IAuthFormData[];
}

/** Live values of the form, keyed by field marker (`FormFieldsSlice`). */
export type SignUpValues = Record<
  string,
  { value: string; valid: boolean } | undefined
>;

/**
 * buildSignUpBody — routes the filled-in form into the three buckets the
 * OneEntry sign-up endpoint expects, by the CMS flag on each field rather than
 * by marker name:
 * - login / password → `authData` **only**;
 * - repeat password → nowhere (the caller checks the match client-side);
 * - everything else → `formData` (profile data — notification fields are
 * included here as well);
 * - notification fields → `notificationData` **additionally**.
 *
 * The notification e-mail prefers the field flagged `isNotificationEmail` and
 * falls back to the login field, because a CMS form may carry only one of them.
 * `phoneSMS` is omitted rather than sent empty — the API rejects a blank value.
 * @param   {object}           input                - Input
 * @param   {IFormAttribute[]} input.attributes     - All CMS fields of the form, in any order
 * @param   {SignUpValues}     input.values         - Live values keyed by marker
 * @param   {string}           input.formIdentifier - `formIdentifier` of the credential auth provider
 * @returns {ISignUpData}                           Request body for `AuthProvider.signUp`
 */
export const buildSignUpBody = ({
  attributes,
  values,
  formIdentifier,
}: {
  attributes: IFormAttribute[];
  values: SignUpValues;
  formIdentifier: string;
}): SignUpBody => {
  /**
   * Trimmed value of one field — every bucket below filters on truthiness, so
   * a whitespace-only entry must read as empty.
   * @param   {string} marker - Field marker
   * @returns {string}        Trimmed value, or `''`
   */
  const value = (marker: string): string =>
    values[marker]?.value?.toString().trim() || '';

  const authData = attributes
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

  const pushField = attributes.find((f) => f.isNotificationPhonePush === true);
  const phonePush =
    pushField && value(pushField.marker) ? [value(pushField.marker)] : [];

  const smsField = attributes.find((f) => f.isNotificationPhoneSMS === true);
  const notificationData: ISignUpData['notificationData'] = {
    email,
    phonePush,
  };
  if (smsField && value(smsField.marker)) {
    notificationData.phoneSMS = value(smsField.marker);
  }

  return { formIdentifier, authData, formData, notificationData };
};
