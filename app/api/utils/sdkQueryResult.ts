import type { IError } from 'oneentry/types';

/**
 * Return shape of an RTK Query `queryFn` backed by a raw SDK call.
 *
 * RTK Query never inspects a thrown value — a `queryFn` that throws rejects the
 * whole thunk instead of putting the hook into its `isError` branch, so every
 * failure has to come back as `{ error }`. This is the client-side counterpart
 * of the throwing guards used by the server wrappers (`expectCmsEntity` /
 * `expectCmsArray`), where a throw is what keeps a bad payload out of
 * `unstable_cache`.
 */
export type SdkQueryResult<T> = { data: T } | { error: IError };
