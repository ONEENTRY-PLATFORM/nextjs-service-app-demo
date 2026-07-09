import { getApi } from '@/app/api';

type LogOutProps = { marker: string; token?: string };

/**
 * User logOut with API AuthProvider
 * @param   {object}          marker        - The marker of the logout method.
 * @param   {string}          marker.marker - The marker of the logout method.
 * @returns {Promise<object>}               result
 * @description — This method requires user authorization. For more information about configuring the authorization module, see the documentation in the configuration settings section of the SDK.
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const logOutUser = async ({ marker }: LogOutProps): Promise<object> => {
  try {
    const token = localStorage.getItem('refresh-token');
    if (!token) {
      throw Error('No token provided');
    }
    const result = await getApi().AuthProvider.logout(marker, token);
    return { data: result };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
};
