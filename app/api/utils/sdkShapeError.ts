import type { IError } from 'oneentry/types';

/**
 * sdkShapeError — build the `IError` an RTK Query hook reports when the SDK
 * answered with something that is not the shape the endpoint promises.
 *
 * Kept as one factory so every shape guard produces the same envelope: `IError`
 * also requires `pageData` and `timestamp`, which have no meaning for a locally
 * detected failure (`502` — the CMS is the failing upstream, not this app).
 * @param   {string}  source   - SDK method name the payload came from
 * @param   {string}  expected - What the endpoint expects, e.g. `an array` or `a payload with "id"`
 * @param   {unknown} received - The value the SDK actually returned
 * @returns {IError}           Error envelope for the `{ error }` branch of a `queryFn`
 */
export const sdkShapeError = (
  source: string,
  expected: string,
  received: unknown,
): IError => ({
  statusCode: 502,
  message: `${source}: CMS returned ${
    received === null ? 'null' : typeof received
  } where ${expected} was expected`,
  pageData: null,
  timestamp: new Date().toISOString(),
});
