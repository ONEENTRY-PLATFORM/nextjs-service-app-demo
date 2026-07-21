/**
 * formatMs — pretty-prints a millisecond value with two decimals and a unit suffix.
 * @param   {number} v - Value in ms.
 * @returns {string}   Formatted string like `"123.45 ms"`; `"—"` when the input is non-finite.
 */
export const formatMs = (v: number): string =>
  Number.isFinite(v) ? `${v.toFixed(2)} ms` : '—';
