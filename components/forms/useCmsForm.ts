'use client';

import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import { useMemo } from 'react';

import { useGetFormByMarkerQuery } from '@/app/api/api/RTKApi';
import { useAppSelector } from '@/app/store/hooks';
import { getFormAttributes } from '@/components/utils/getFormAttributes';
import { sortArrayByPosition } from '@/components/utils/sortArrayByPosition';

/** The CMS form definition plus the live values every auth form renders from. */
export interface CmsForm {
  /** Form fields as configured in the CMS, ordered by their `position` */
  attributes: IFormAttribute[];
  /** Live field values and validity, keyed by marker (`FormFieldsSlice`) */
  fields: Record<string, { value: string; valid: boolean }>;
  /** The form definition is still being fetched */
  isLoading: boolean;
  /** A response has arrived (even an empty form) — `false` while unresolved */
  hasForm: boolean;
  /** The form could not be fetched (RTK Query error), `undefined` when fine */
  error: unknown;
}

/**
 * useCmsForm — the three things every auth form starts from: the CMS form
 * definition behind a marker, its fields sorted into the order the admin panel
 * defines, and the live values held in `FormFieldsSlice`.
 *
 * Ordering goes through `sortArrayByPosition` rather than an inline `.sort()`
 * so the CMS field order stays authoritative in exactly one place, and
 * `getFormAttributes` normalizes the array-or-object shape the Forms API
 * returns (`{}` for a form with no fields).
 *
 * An empty marker skips the request instead of asking the CMS for `''` — the
 * profile form only knows its marker once the user has loaded.
 * @param   {string}  marker - Marker of the form in the CMS (e.g. `reg`)
 * @returns {CmsForm}        Sorted attributes, live field values and the request state
 */
export const useCmsForm = (marker: string): CmsForm => {
  const { data, isLoading, error } = useGetFormByMarkerQuery(
    { marker },
    { skip: !marker },
  );

  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  const attributes = useMemo(
    () => sortArrayByPosition(getFormAttributes<IFormAttribute>(data)),
    [data],
  );

  return { attributes, fields, isLoading, hasForm: data !== undefined, error };
};
