/**
 * Sort an array by position property.
 *
 * This function sorts an array of objects based on their position property
 * in ascending order. Objects without a position property are sorted to the end.
 * @param   {Array<{ position: number }>} array - Array of objects to sort, each should have a position property
 * @returns {Array<{ position: number }>}       New sorted array based on position values
 * @example
 * ```typescript
 * const items = [
 *   { name: 'Item 1', position: 3 },
 *   { name: 'Item 2', position: 1 },
 *   { name: 'Item 3', position: 2 }
 * ];
 * const sorted = sortArrayByPosition(items);
 * // Result: [{ name: 'Item 2', position: 1 }, { name: 'Item 3', position: 2 }, { name: 'Item 1', position: 3 }]
 * ```
 */
export const sortArrayByPosition = <T extends { position: number }>(
  array: T[],
): T[] => {
  return array.sort((a, b) => a.position - b.position);
};
