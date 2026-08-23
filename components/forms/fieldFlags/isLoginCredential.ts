import type { IFormAttribute } from 'oneentry/types';

import { isPasswordField } from './isPasswordField';

/**
 * Whether the field is a login or password credential and therefore belongs in
 * `authData` rather than `formData`.
 *
 * Login credentials (`isLogin`, `isPassword`) must go ONLY into authData — a
 * password left in formData breaks login.
 * @param   {IFormAttribute} field - The form field to check
 * @returns {boolean}              True for login or password fields
 */
export const isLoginCredential = (field: IFormAttribute): boolean =>
  field.isLogin === true || isPasswordField(field);
