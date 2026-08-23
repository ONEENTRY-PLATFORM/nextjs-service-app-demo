import type { IFormAttribute } from 'oneentry/types';

/**
 * Whether the CMS flagged the field as a password input.
 *
 * Fields are routed into authData / formData / notificationData by the flags
 * configured in the OneEntry admin panel, NOT by hardcoded markers.
 * @param   {IFormAttribute} field - The form field to check
 * @returns {boolean}              True when `isPassword` is set on the field
 */
export const isPasswordField = (field: IFormAttribute): boolean =>
  field.isPassword === true;
