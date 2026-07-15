/**
 * OneEntry auth event markers for the password-reset flow.
 *
 * These identifiers are passed to `AuthProvider.generateCode` / `checkCode` /
 * `changePassword` and MUST match markers configured in the OneEntry admin panel
 * under Settings → Events. Keep the primary code generation and the resend on the
 * SAME marker so a resent code is validated by the same event that issued it.
 *
 * ⚠️ As of the last inspection the admin Events section is empty — until these
 * events are created there, the password-reset flow will fail on `generateCode`.
 */

/** Event that generates and sends the password-reset OTP (primary send AND resend). */
export const EVENT_RESET_GENERATE = 'generate_otp';

/** Event that validates the entered OTP (checkCode) and authorizes changePassword. */
export const EVENT_RESET_VERIFY = 'otp';
