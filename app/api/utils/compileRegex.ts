/**
 * Convert mask string to regex pattern
 * @param   {string | undefined} mask - Mask string to convert to regex
 * @returns {string}                  Regex pattern string
 */
function maskToRegex(mask: string | undefined): string {
  const maskRules: { [key: string]: string } = {
    '\\[\\[space\\]\\]': '\\s',
    '\\$': '[\\(\\)\\-\\+]',
    '9': '\\d',
    A: '[A-Z]',
    a: '[a-z]',
    '\\*': '[\\dA-Za-z]',
  };

  let regexPattern: string = '';
  if (mask !== undefined) {
    regexPattern = mask.toString();
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key in maskRules) {
    const regex = new RegExp(key, 'g');
    if (!maskRules[key]) {
      return regexPattern;
    }
    regexPattern = regexPattern.replace(regex, maskRules[key]);
  }
  return regexPattern;
}

/**
 * Compile mask string to RegExp object
 * @param   {string | undefined} mask - Mask string to compile to RegExp
 * @returns {RegExp}                  Compiled RegExp object
 */
export function compileRegex(mask: string | undefined) {
  const regexPattern = maskToRegex(mask);
  return new RegExp(`^${regexPattern}$`);
}
