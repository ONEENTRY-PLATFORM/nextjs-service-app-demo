import type { IAuthFormData } from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IError } from 'oneentry/dist/base/utils';
import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

type Cart = Record<string, number> | object;

/**
 * Persist the user's cart into `user.state`.
 *
 * ⚠️ Currently UNUSED — legacy of an unfinished `user.state.cart` sync (see the
 * cart-sync stub in `AuthContext`). The live cart runs on Redux + redux-persist
 * (`CartSlice`); nothing calls this, `clearUserState`, or the
 * `useUpdateUserStateMutation` hook today. Kept per project convention — wire it
 * into the CartSlice write sites (or the native cart API) if server-side cart
 * persistence is picked up.
 *
 * Always fetches the freshest user via `getUser()` right before writing so that
 * concurrent updates (e.g. favorites) aren't clobbered, and spreads
 * `...user.state` to preserve other fields.
 * @param   {object}           props      - Update payload
 * @param   {Cart}             props.cart - Cart map to persist
 * @returns {Promise<boolean>}            True on success, false on SDK error
 */
export const updateUserState = async ({
  cart,
}: {
  cart: Cart;
}): Promise<boolean> => {
  const fresh = await getApi().Users.getUser();
  if (isError(fresh)) {
    return false;
  }
  const user = fresh as IUserEntity;

  const formData: IAuthFormData[] = (user.formData ?? [])
    .filter(
      (item): item is { marker: string; type: string; value: string } =>
        typeof (item as { marker?: unknown }).marker === 'string' &&
        (item as { marker: string }).marker !== 'otp_code',
    )
    .map((item) => ({
      marker: item.marker,
      type: 'string',
      value: String(item.value ?? ''),
    }));

  /**
   * First string value of a `formData` entry by marker.
   * @param   {string}             marker - Form field marker to look up
   * @returns {string | undefined}        The string value, or `undefined` when absent / non-string
   */
  const findValue = (marker: string): string | undefined => {
    const hit = (user.formData ?? []).find(
      (item) => (item as { marker?: string }).marker === marker,
    ) as { value?: unknown } | undefined;
    return typeof hit?.value === 'string' ? hit.value : undefined;
  };

  const res = await getApi().Users.updateUser({
    formIdentifier: user.formIdentifier,
    formData,
    state: { ...user.state, cart },
    notificationData: {
      email: findValue('email_reg') ?? '',
      phonePush: [],
      phoneSMS: findValue('phone_reg') ?? '',
    },
  });

  if (!res || (res as IError)?.statusCode) {
    return false;
  }
  return res === true;
};

/**
 * Clear user cart by writing an empty object into `user.state.cart`.
 *
 * Other state fields (favorites, etc.) are preserved by `updateUserState`.
 * @returns {Promise<boolean>} True on success
 */
export const clearUserState = async (): Promise<boolean> => {
  return updateUserState({ cart: {} });
};
