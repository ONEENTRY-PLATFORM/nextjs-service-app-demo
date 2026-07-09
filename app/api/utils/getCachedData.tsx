import 'server-only';

const cache = new Map<string, unknown>();

/**
 * Get cached data with a specific key, or fetch it if not cached
 *
 * This function implements a simple in-memory caching mechanism. It checks if data
 * with the provided key exists in the cache. If it does, it returns the cached data.
 * If not, it executes the provided fetch function, caches the result, and returns it.
 * @param   {string}           key     - The cache key to identify the data
 * @param   {() => Promise<T>} fetchFn - An async function that fetches the data if not cached
 * @returns {Promise<T>}               The cached or freshly fetched data
 */
const getCachedData = async <T,>(
  key: string,
  fetchFn: () => Promise<T>,
): Promise<T> => {
  if (cache.has(key)) {
    return cache.get(key) as T;
  }
  const data = await fetchFn();
  cache.set(key, data);
  return data;
};

export default getCachedData;
