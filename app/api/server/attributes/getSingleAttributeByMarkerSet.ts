import type { IAttributesSetsEntity, IError } from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsEntity } from '@/app/api/utils/expectCmsEntity';

/**
 * Cached reader: TTL, request-level dedupe and transient-failure handling.
 *
 * Attribute sets are schema, edited rarely in the admin panel — hence the
 * 5-minute TTL. Takes primitives so both cache layers key on them (React
 * `cache()` compares arguments by identity, so the public object argument would
 * never hit).
 */
const readSingleAttributeByMarkerSet = createCachedCmsReader<
  [string, string],
  IAttributesSetsEntity
>({
  cacheKey: 'oneentry-single-attribute-by-marker-set',
  label: 'getSingleAttributeByMarkerSet',
  revalidate: 300,
  tags: ['oneentry', 'oneentry-attributes'],
  /**
   * SDK signature is `(setMarker, attributeMarker, langCode)` — the URL is
   * built as `/${setMarker}/attributes/${attributeMarker}`. The SDK's own
   * `.d.ts` declares the arguments in the opposite order, so pass them
   * positionally in the runtime order, not the way the types suggest.
   * @param   {string}                         attributeMarker - Attribute marker within the set
   * @param   {string}                         setMarker       - Attribute set marker
   * @returns {Promise<IAttributesSetsEntity>}                 Raw SDK payload for the attribute
   */
  call: (attributeMarker, setMarker) =>
    getApi().AttributesSets.getSingleAttributeByMarkerSet(
      setMarker,
      attributeMarker,
    ),
  validate: (data) =>
    expectCmsEntity(data, 'getSingleAttributeByMarkerSet', 'marker'),
});

/**
 * getSingleAttributeByMarkerSet — get a single attribute with data from the
 * attribute sets.
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: attribute sets are read as part of the page/product payload, never on their own.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
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
}> => {
  const {
    isError: failed,
    error,
    data,
  } = await readSingleAttributeByMarkerSet(attributeMarker, setMarker);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { attribute: data } : {}),
  };
};
