import { unstable_cache } from 'next/cache';
import type { IAttributesSetsEntity } from 'oneentry/dist/attribute-sets/attributeSetsInterfaces';
import type { IError } from 'oneentry/dist/base/utils';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/**
 * Fetch a single attribute of a set from OneEntry, cached across requests
 * (private helper).
 *
 * Attribute sets are schema, edited rarely in the admin panel — hence the
 * 5-minute TTL. Takes primitives so both cache layers key on them (React
 * `cache()` compares arguments by identity, so the public object argument would
 * never hit).
 * @param   {string}          attributeMarker - Marker of the attribute in the set
 * @param   {string}          setMarker       - Marker of the attribute set
 * @returns {Promise<object>}                 Envelope with the attribute or the error
 */
const getSingleAttributeByMarkerSetImpl = unstable_cache(
  async (
    attributeMarker: string,
    setMarker: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    attribute?: IAttributesSetsEntity;
  }> => {
    try {
      /**
       * SDK signature is `(setMarker, attributeMarker, langCode)` — the URL is
       * built as `/${setMarker}/attributes/${attributeMarker}`. The SDK's own
       * `.d.ts` declares the arguments in the opposite order, so pass them
       * positionally in the runtime order, not the way the types suggest.
       */
      const attribute = await withTimeout(
        getApi().AttributesSets.getSingleAttributeByMarkerSet(
          setMarker,
          attributeMarker,
        ),
        10_000,
        'getSingleAttributeByMarkerSet',
      );

      if (isError(attribute)) {
        return { isError: true, error: attribute };
      }
      return { isError: false, attribute };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-single-attribute-by-marker-set'],
  { revalidate: 300, tags: ['oneentry', 'oneentry-attributes'] },
);

/** Request-level dedupe, keyed by the two markers. */
const getSingleAttributeByMarkerSetCached = cache(
  getSingleAttributeByMarkerSetImpl,
);

/**
 * Get a single attribute with data from the attribute sets.
 * @param   {object}                                props                 - Object with parameters.
 * @param   {string}                                props.attributeMarker - Text identifier (marker) of the attribute in the set.
 * @param   {string}                                props.setMarker       - Text identifier (marker) of the attribute set.
 * @returns {Promise<IAttributesSetsEntity|IError>}                       SingleAttribute|Error object.
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getSingleAttributeByMarkerSet = async ({
  attributeMarker,
  setMarker,
}: {
  attributeMarker: string;
  setMarker: string;
}): Promise<{
  isError: boolean;
  error?: IError;
  attribute?: IAttributesSetsEntity;
}> => await getSingleAttributeByMarkerSetCached(attributeMarker, setMarker);
