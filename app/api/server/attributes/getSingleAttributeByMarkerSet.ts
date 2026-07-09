import type { IAttributesSetsEntity } from 'oneentry/dist/attribute-sets/attributeSetsInterfaces';
import type { IError } from 'oneentry/dist/base/utils';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

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
}> => {
  try {
    const attribute =
      await getApi().AttributesSets.getSingleAttributeByMarkerSet(
        attributeMarker,
        setMarker,
      );

    if (isError(attribute)) {
      return { isError: true, error: attribute };
    }
    return { isError: false, attribute };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
