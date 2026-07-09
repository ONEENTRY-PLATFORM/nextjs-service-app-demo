'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import {
  useGetAdminsQuery,
  useGetPageByIdQuery,
  useGetProductByIdQuery,
} from '@/app/api';

import { useAppSelector } from './hooks';
import type { CartItem } from './reducers/CartSlice';
import { selectActiveItemId, selectCartData } from './reducers/CartSlice';

/**
 * Hydrated cart item — raw IDs from Redux plus the resolved OneEntry entities.
 *
 * Entities may be `undefined` while their RTK Query request is in flight,
 * or when the corresponding ID is absent from the cart row.
 */
export interface HydratedCartItem {
  /** Raw IDs-only cart row from Redux state. */
  item: CartItem | undefined;
  salon: IPagesEntity | undefined;
  service: IPagesEntity | undefined;
  product: IProductsEntity | undefined;
  master: IAdminEntity | undefined;
  date: Date | undefined;
  interval: Date[] | undefined;
}

/**
 * Read the currently-active cart row and hydrate its entity references from
 * the RTK Query cache.
 *
 * The raw Redux state only stores IDs (`salonId`, `serviceId`, `productId`,
 * `masterId`). This hook fetches the corresponding `IPagesEntity` /
 * `IProductsEntity` / `IAdminEntity` objects on demand. Each underlying query
 * is skipped when its ID is absent, so unrelated entities don't trigger
 * requests.
 *
 * Masters are fetched as a single list via `useGetAdminsQuery` because the
 * SDK has no get-by-id endpoint for admins; the list is cached for 10 minutes,
 * so the cost is amortized across the booking flow.
 * @returns {HydratedCartItem} The active cart row with resolved entities.
 */
const useCartItem = (): HydratedCartItem => {
  const activeId = useAppSelector(selectActiveItemId);
  const servicesData = useAppSelector(selectCartData);
  const item = servicesData.find((row) => row.id === activeId);

  const { data: salon } = useGetPageByIdQuery(
    { id: item?.salonId ?? 0 },
    { skip: !item?.salonId },
  );
  const { data: service } = useGetPageByIdQuery(
    { id: item?.serviceId ?? 0 },
    { skip: !item?.serviceId },
  );
  const { data: product } = useGetProductByIdQuery(
    { id: item?.productId ?? 0 },
    { skip: !item?.productId },
  );
  const { data: admins } = useGetAdminsQuery(undefined, {
    skip: !item?.masterId,
  });

  /** React Compiler handles memoization of this lookup automatically */
  const master = item?.masterId
    ? admins?.find((a) => a.id === item.masterId)
    : undefined;

  return {
    item,
    salon,
    service,
    product,
    master,
    date: item?.date,
    interval: item?.interval,
  };
};

export default useCartItem;
