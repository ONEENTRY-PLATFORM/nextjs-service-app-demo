/**
 * expectCmsEntity — guarantee that a "single entity" payload from the CMS really
 * is the entity, not the `{}` the SDK's shell mode fabricates.
 *
 * The OneEntry SDK runs in shell mode (`isShell: true` is its default), so a
 * dropped connection, a socket timeout or an empty `200` body does **not**
 * throw: `browserResponse` returns the caught error as if it were data and
 * `_normalizeData` flattens it into a bare `{}` (an `Error`'s own properties are
 * non-enumerable). `isError({})` is `false` — it only looks for a numeric
 * `statusCode` — so that `{}` sails through `fetchCmsData` as a success and gets
 * stored under a key the envelope types as an entity. The crash then surfaces
 * far away, inside a server component reading `page.attributeValues` or
 * `block.localizeInfos` off an object that has neither — or worse, renders a
 * silently empty section. A real entity always carries its identifying key
 * (`id`, `pageUrl`, `marker`, …), which `{}` cannot fake.
 *
 * Throwing here is deliberate. Called from inside an `unstable_cache` callback,
 * a throw puts this failure in the same class as the transient errors
 * `fetchCmsData` already rethrows: the bad payload is **not** cached, and the
 * wrapper's own `catch` degrades just this request to `{ isError: true }`.
 * Returning the `{}` instead would cache a hollow entity for the whole
 * revalidate window and turn a blip into a silently broken page.
 * @param   {unknown} data        - Payload returned by the SDK call
 * @param   {string}  source      - Wrapper name, for the thrown message
 * @param   {string}  requiredKey - Key every real instance of the entity carries (e.g. `'id'`, `'pageUrl'`)
 * @returns {T}                   The payload, once proven to carry the key
 * @throws  {Error}               When the SDK returned anything other than an object with `requiredKey`
 */
export const expectCmsEntity = <T extends object>(
  data: unknown,
  source: string,
  requiredKey: string,
): T => {
  if (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    requiredKey in data
  ) {
    return data as T;
  }
  throw new Error(
    `${source}: CMS returned a payload without "${requiredKey}" (${
      data === null ? 'null' : typeof data
    }) — treating it as a transient failure`,
  );
};
