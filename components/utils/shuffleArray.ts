/**
 * Shuffle an array randomly.
 *
 * This function takes an array and returns a new array with the elements
 * in a random order. It uses the Fisher-Yates shuffle algorithm approach
 * by mapping each element to a random sort key, sorting by that key,
 * and then extracting the original values.
 * @param   {Array} array - Array to shuffle
 * @returns {Array}       New array with elements in random order
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};
