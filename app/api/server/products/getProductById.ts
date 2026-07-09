import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get product by ID from the OneEntry API
 *
 * This function fetches a specific product by its ID from the OneEntry API.
 * It handles error cases and returns a consistent response format.
 * @param   {number}          id - The numeric ID of the product to fetch
 * @returns {Promise<object>}    Promise that resolves to an object containing the product data or error information
 * @see {@link https://oneentry.cloud/instructions/npm|OneEntry docs}
 */
export const getProductById = async (
  id: number,
): Promise<{
  isError: boolean;
  error?: IError;
  product?: IProductsEntity;
}> => {
  try {
    const data = await getApi().Products.getProductById(id);

    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, product: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
