import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get all related product page objects with API.Products
 * @param   {number}          id - Product page identifier for which to find relationship.
 * @returns {Promise<object>}    Promise that resolves to an object containing products, error status, and total count
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getRelatedProductsById = async (
  id: number,
): Promise<{
  isError: boolean;
  error?: IError;
  products?: IProductsEntity[];
  total: number;
}> => {
  try {
    const data = await getApi().Products.getRelatedProductsById(id);

    if (isError(data)) {
      return { isError: true, error: data, total: 0 };
    }
    return {
      isError: false,
      products: data.items,
      total: data.total,
    };
  } catch (e) {
    return { isError: true, error: e as IError, total: 0 };
  }
};
