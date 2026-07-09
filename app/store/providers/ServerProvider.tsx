import 'server-only';

import { cache } from 'react';

const serverContext = cache(() => new Map<string, unknown>());

/**
 * Simple server provider.
 * @param   {string}  key          - key.
 * @param   {unknown} defaultValue - defaultValue.
 * @returns {Array}                Provider [value, setter] tuple.
 */
export const ServerProvider = <T,>(
  key: string,
  defaultValue?: T,
): [T, (value: T) => void] => {
  const global = serverContext();

  if (defaultValue !== undefined) {
    global.set(key, defaultValue);
  }

  return [global.get(key) as T, (value: T) => global.set(key, value)];
};
