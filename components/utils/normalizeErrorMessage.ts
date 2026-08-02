/**
 * normalizeErrorMessage — collapse an `IError.message` that may arrive as an
 * array into one displayable string.
 *
 * The SDK types `message` as `string`, but validation 400s from
 * `postFormsData` and the auth endpoints actually send an ARRAY of strings;
 * passing it on raw either renders the entries glued together (React state)
 * or comma-joins them via implicit `toString` (template literals). Every
 * display site routes through this helper, per the error-handling rule's
 * "Normalizing message" section.
 * @param   {string | string[] | undefined} message - Raw `IError.message`
 * @returns {string}                                Joined single-line message (`''` when absent)
 */
export const normalizeErrorMessage = (
  message: string | string[] | undefined,
): string => (Array.isArray(message) ? message.join('; ') : (message ?? ''));
