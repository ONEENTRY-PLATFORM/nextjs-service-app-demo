/**
 * toErrorMessage — pull a human-readable string out of a caught value.
 *
 * A `catch` receives `unknown`: a real `Error` carries a `.message`, but a
 * rejected promise can throw anything. Every form and submit handler had its own
 * `e instanceof Error ? e.message : '<fallback>'` line; this centralises the
 * narrowing so only the fallback wording differs between call sites.
 * @param   {unknown} error      - Whatever a `catch` received
 * @param   {string}  [fallback] - Shown when the value is not an `Error`
 * @returns {string}             The error's message, or the fallback
 */
export const toErrorMessage = (
  error: unknown,
  fallback = 'An unexpected error occurred',
): string => (error instanceof Error ? error.message : fallback);
