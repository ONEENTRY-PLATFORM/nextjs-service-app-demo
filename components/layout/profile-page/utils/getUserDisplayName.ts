import type { FormDataType, IUserEntity } from 'oneentry/types';

/** A `formData` entry that carries a string `marker` and a `value`. */
type MarkerField = FormDataType & { marker: string; value: unknown };

/**
 * Narrows a `FormDataType` union member to the marker-bearing shape.
 *
 * The SDK's `FormDataType` union includes a bare `Record<string, unknown>`
 * variant without a `marker`, so `formData` items must be guarded before their
 * `marker`/`value` are read.
 * @param   {FormDataType}         field - A single `formData` entry
 * @returns {field is MarkerField}       True when the entry carries a string `marker`
 */
const hasMarker = (field: FormDataType): field is MarkerField =>
  typeof (field as { marker?: unknown }).marker === 'string';

/**
 * Reads a string value from a `formData` entry by its marker.
 * @param   {MarkerField[]} fields - Guarded `formData` entries
 * @param   {string}        marker - The `reg`-form marker to look up
 * @returns {string}               Trimmed value, or an empty string when absent
 */
const readField = (fields: MarkerField[], marker: string): string => {
  const value = fields.find((f) => f.marker === marker)?.value;
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Derives a human-readable display name for a user from their `reg`-form data.
 *
 * Uses the `name_reg` attribute of the registration form, falling back to the
 * local part of the `email_reg`, then the user identifier, and finally a generic
 * label so the UI never renders an empty name.
 * @param   {IUserEntity | undefined} user - Authenticated user entity from AuthContext
 * @returns {string}                       Best-effort display name (never empty)
 */
export const getUserDisplayName = (user: IUserEntity | undefined): string => {
  if (!user) {
    return 'Guest';
  }

  const fields = (Array.isArray(user.formData) ? user.formData : []).filter(
    hasMarker,
  );

  const name = readField(fields, 'name_reg');
  if (name) {
    return name;
  }

  const email = readField(fields, 'email_reg');
  if (email.includes('@')) {
    return email.split('@')[0] ?? email;
  }

  return user.identifier || 'Guest';
};
