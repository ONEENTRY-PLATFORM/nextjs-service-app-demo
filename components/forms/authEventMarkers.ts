/**
 * OneEntry event markers, as configured in the admin panel under Events.
 *
 * These are passed as `eventIdentifier` to `AuthProvider.generateCode` /
 * `checkCode` / `changePassword`. The event is what ISSUES a one-time code, so
 * every call in a single flow must name the SAME event — a code generated under
 * one event cannot be verified under another. That is why there is one constant
 * per FLOW here, not one per API call.
 *
 * Markers are project-specific and must never be guessed: `Events.getAllEvents()`
 * answers 401 with the project token (despite the SDK docs calling it public),
 * and `checkCode` returns a plain `false` for a marker that does not exist —
 * exactly like a wrong code — so neither can confirm one. The authoritative
 * source is the admin panel → Events.
 *
 * Values below are the identifiers ACTUALLY present in this project's admin
 * panel (read back 2026-07-16, `.claude/temp/list-events.mjs`) — not the
 * conventional OneEntry names, which differ here (`reset_password`, not
 * `password_reset`).
 */

/**
 * Password reset: issues the OTP and authorizes the new password.
 *
 * Used by `generateCode` (initial send AND resend), `checkCode` and
 * `changePassword` — one and the same event across the whole flow.
 *
 * Confirmed live 2026-07-16: `generateCode('email', <user>, 'reset_password')`
 * returned success (`void`), i.e. the API accepted this event and sent the mail.
 */
export const EVENT_PASSWORD_RESET = 'reset_password';

/**
 * Registration: issues the account-activation OTP.
 *
 * Used by `generateCode` when resending the activation code. The activation
 * itself goes through `activateUser`, which takes no `eventIdentifier`. This is
 * a DIFFERENT event from the reset above: resending an activation code under the
 * password-reset event would issue a code `activateUser` cannot accept.
 *
 * Admin panel id 2, name "Registration otp", `formType: 'registration'` — picked
 * by that name, NOT verified against the API: `generateCode` refuses a second
 * send with "User already has a code" while any code is outstanding, which masks
 * whether the event itself was accepted, so the probe cannot discriminate.
 *
 * Currently unreachable: the `email` provider has `isCheckCode: false`, so
 * `signUp` returns `isActive: true` and `SignUpForm` logs the user straight in
 * without ever entering the activation branch. This constant only starts
 * mattering if activation is switched on in the admin panel — re-verify then.
 *
 * (The admin also holds `generate_otp`, name "Generate code",
 * `formType: 'send_code'`, which no code path uses.)
 */
export const EVENT_REGISTRATION = 'otp';
