import type { FormDataType } from 'oneentry/dist/forms-data/formsDataInterfaces';
import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';

/** Markers that may hold a human-readable name, in priority order. */
const NAME_MARKERS = [
  'name',
  'first_name',
  'name_reg',
  'full_name',
  'last_name',
] as const;

/** Markers that may hold the user's e-mail (used as a fallback name source). */
const EMAIL_MARKERS = ['email_reg', 'email'] as const;

/**
 * Narrows a `FormDataType` union member to the marker-bearing shape.
 *
 * The SDK's `FormDataType` union includes a bare `Record<string, unknown>`
 * variant without a `marker`, so `formData` items must be guarded before their
 * `marker`/`value` are read.
 * @param   {FormDataType} field - A single `formData` entry
 * @returns {boolean}            True when the entry carries a string `marker`
 */
const hasMarker = (
  field: FormDataType,
): field is FormDataType & { marker: string; value: unknown } =>
  typeof (field as { marker?: unknown }).marker === 'string';

/**
 * Derives a human-readable display name for a user from their `formData`.
 *
 * Looks through the known name markers first, then falls back to the local part
 * of the e-mail, then the user identifier, and finally a generic label. Kept
 * defensive because the `reg` form currently exposes no attributes, so the
 * exact markers present on a user vary.
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

  for (const marker of NAME_MARKERS) {
    const field = fields.find((f) => f.marker === marker);
    const value = field?.value;
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  for (const marker of EMAIL_MARKERS) {
    const field = fields.find((f) => f.marker === marker);
    const value = field?.value;
    if (typeof value === 'string' && value.includes('@')) {
      return value.split('@')[0] ?? value;
    }
  }

  return user.identifier || 'Guest';
};
