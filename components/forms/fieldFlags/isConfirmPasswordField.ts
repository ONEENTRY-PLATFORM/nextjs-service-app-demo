import type { IFormAttribute } from 'oneentry/types';

import { isPasswordField } from './isPasswordField';

/**
 * UI-only "repeat password" confirmation field: rendered masked by FormInput
 * (marker contains "password") but not flagged `isPassword` in the CMS. There
 * is no dedicated CMS flag for confirm fields, so the marker heuristic is the
 * only signal. Must never be submitted — it only guards against typos.
 * @param   {IFormAttribute} field - The form field to check
 * @returns {boolean}              Whether the field is a confirmation password field
 */
export const isConfirmPasswordField = (field: IFormAttribute): boolean =>
  !isPasswordField(field) && field.marker.toLowerCase().includes('password');
