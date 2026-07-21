/**
 * Sort object fields by position property.
 *
 * This function sorts the fields of an object based on their position property
 * and returns a new object with the fields in the sorted order.
 * @param   {Record<string, { position: number }>} obj - Object with fields to sort, each field should have a position property
 * @returns {Record<string, { position: number }>}     New object with fields sorted by position values
 * @example
 * ```typescript
 * const obj = {
 *   field1: { name: 'Field 1', position: 3 },
 *   field2: { name: 'Field 2', position: 1 },
 *   field3: { name: 'Field 3', position: 2 }
 * };
 * const sorted = sortObjectFieldsByPosition(obj);
 * // Result: { field2: { name: 'Field 2', position: 1 }, field3: { name: 'Field 3', position: 2 }, field1: { name: 'Field 1', position: 3 } }
 * ```
 */
export const sortObjectFieldsByPosition = <T extends { position: number }>(
  obj: Record<string, T>,
): Record<string, T> => {
  const entries = Object.entries(obj);
  entries.sort((a, b) => a[1].position - b[1].position);
  const sortedObj: Record<string, T> = {};
  for (const [key, value] of entries) {
    sortedObj[key] = value;
  }
  return sortedObj;
};
