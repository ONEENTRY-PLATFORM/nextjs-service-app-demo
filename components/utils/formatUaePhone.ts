/**
 * Format a raw UAE phone number for display.
 *
 * The CMS stores salon phones as a compact string (e.g. `+97147012200`);
 * the design shows them spaced by group. This normalizes to digits, strips
 * the `971` country code (or a local leading `0`), then regroups: landline
 * as `+971 A BBB CCCC` (8 national digits) and mobile as `+971 5X XXX XXXX`
 * (9 national digits, `5`-prefixed). Any unrecognized shape is returned
 * trimmed and unchanged, and empty input yields an empty string.
 * @param   {string | undefined | null} raw - Raw phone string from the `salon_phone` attribute
 * @returns {string}                        Human-readable phone, or `''` when input is empty
 * @example
 * ```typescript
 * formatUaePhone('+97147012200');  // "+971 4 701 2200"
 * formatUaePhone('+971501234567'); // "+971 50 123 4567"
 * ```
 */
export const formatUaePhone = (raw: string | undefined | null): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  let national = trimmed.replace(/\D/g, '');
  if (national.startsWith('971')) national = national.slice(3);
  else if (national.startsWith('0')) national = national.slice(1);
  if (national.length === 9 && national.startsWith('5')) {
    return `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
  }
  if (national.length === 8) {
    return `+971 ${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
  }
  return trimmed;
};
