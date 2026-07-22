/**
 * expectCmsArray — guarantee that a "list" payload from the CMS really is an array.
 *
 * The OneEntry SDK runs in shell mode (`isShell: true` is its default), so a
 * dropped connection, a socket timeout or an empty `200` body does **not**
 * throw: `browserResponse` returns the caught error as if it were data and
 * `_normalizeData` flattens it into a bare `{}` (an `Error`'s own properties are
 * non-enumerable). `isError({})` is `false` — it only looks for a numeric
 * `statusCode` — so that `{}` sails through `fetchCmsData` as a success and gets
 * stored under a key the envelope types as an array. The crash then surfaces far
 * away, inside a server component: `.map`, `.sort` and `for..of` all throw on a
 * plain object, and `?? []` cannot help because `{}` is neither `null` nor
 * `undefined`.
 *
 * That is not a theory: the 2026-07-23 e2e run produced three separate 500s from
 * this one cause — `(c ?? []).sort` on the homepage, `categoryPages.map` in the
 * services catalog and `for (const photoPage of photoPages)` in the gallery,
 * the last of which broke `/salons/{handle}` and `/gallery/{handle}` by crashing
 * the route before it could reach its own `notFound()`.
 *
 * Throwing here is deliberate. Called from inside an `unstable_cache` callback,
 * a throw puts this failure in the same class as the transient errors
 * `fetchCmsData` already rethrows: the bad payload is **not** cached, and the
 * wrapper's own `catch` degrades just this request to `{ isError: true }`.
 * Returning `[]` instead would cache an empty list for the whole revalidate
 * window and turn a blip into a silently empty page.
 * @param   {unknown} data   - Payload returned by the SDK call
 * @param   {string}  source - Wrapper name, for the thrown message
 * @returns {T[]}            The payload, once proven to be an array
 * @throws  {Error}          When the SDK returned anything other than an array
 */
export const expectCmsArray = <T>(data: unknown, source: string): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }
  throw new Error(
    `${source}: CMS returned a non-array payload (${
      data === null ? 'null' : typeof data
    }) — treating it as a transient failure`,
  );
};
