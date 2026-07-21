'use client';

import type { IError } from 'oneentry/dist/base/utils';
import type {
  IBodyPostFormData,
  IPostFormResponse,
} from 'oneentry/dist/forms-data/formsDataInterfaces';
import { useState } from 'react';

import { getApi } from '@/app/api/api/api';

/**
 * Custom hook for submitting form data using the OneEntry FormData API.
 *
 * Handles loading state and returns the submission result.
 * @returns {object} `{ loading, sendData }` — `loading` boolean and an async submit function.
 */
export const useSetForm = (): {
  loading: boolean;
  sendData: (data: IBodyPostFormData) => Promise<IPostFormResponse | IError>;
} => {
  const [loading, setLoading] = useState<boolean>(false);

  const sendData = async (
    data: IBodyPostFormData,
  ): Promise<IPostFormResponse | IError> => {
    setLoading(true);
    try {
      const res = await getApi().FormData.postFormsData(data);
      return res;
    } catch (e: unknown) {
      return e as IError;
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendData };
};
