/**
 * Wrap each character of a text string in span elements
 *
 * This utility function takes a string and wraps each individual character
 * in a span HTML element. This is useful for creating character-level animations
 * where each character needs to be manipulated independently.
 * @param   {string} text - The input text string to process
 * @returns {string}      A string with each character wrapped in span tags
 */
function wrapCharactersInSpan(text: string): string {
  let result = '';
  for (const char of text) {
    result += `<span>${char}</span>`;
  }
  return result;
}

export default wrapCharactersInSpan;
