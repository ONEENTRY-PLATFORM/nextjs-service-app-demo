/**
 * formatBytes — pretty-prints a byte count using KB / MB units when appropriate.
 * @param   {number} v - Byte count.
 * @returns {string}   Formatted string with the largest unit that keeps the number ≥ 1.
 */
export const formatBytes = (v: number): string => {
  if (!Number.isFinite(v) || v <= 0) return '0 B';
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(2)} MB`;
};
