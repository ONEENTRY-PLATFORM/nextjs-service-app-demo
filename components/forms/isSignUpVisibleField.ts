import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';

import { isLoginCredential } from '@/components/forms/fieldFlags/isLoginCredential';

/**
 * isSignUpVisibleField — whether a CMS form field is rendered on the sign-up
 * form. Everything is shown except PURE notification fields: those exist only
 * to receive mail/SMS/push and have no place in the registration UI.
 *
 * A notification field that also carries a login credential or is flagged
 * `isSignUp` / `isSignUpRequired` is NOT pure — the admin explicitly asked for
 * it at registration, so the flag wins over the visibility rule.
 * @param   {IFormAttribute} field - CMS form field
 * @returns {boolean}              `true` when the field belongs on the sign-up form
 */
export const isSignUpVisibleField = (field: IFormAttribute): boolean => {
  const isNotification =
    field.isNotificationEmail === true ||
    field.isNotificationPhoneSMS === true ||
    field.isNotificationPhonePush === true;

  const isPureNotification =
    isNotification &&
    !isLoginCredential(field) &&
    field.isSignUp !== true &&
    field.isSignUpRequired !== true;

  return !isPureNotification;
};
