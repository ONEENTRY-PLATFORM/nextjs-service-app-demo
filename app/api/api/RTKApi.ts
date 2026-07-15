import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAuthProvidersEntity } from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { IFormsEntity } from 'oneentry/dist/forms/formsInterfaces';
import type {
  IBaseOrdersEntity,
  IOrderByMarkerEntity,
  IOrderData,
  IOrdersEntity,
} from 'oneentry/dist/orders/ordersInterfaces';
import type {
  IPagesEntity,
  IPositionBlock,
} from 'oneentry/dist/pages/pagesInterfaces';
import type {
  IAccountsEntity,
  ISessionEntity,
} from 'oneentry/dist/payments/paymentsInterfaces';
import type {
  IFilterParams,
  IProductsEntity,
  IProductsResponse,
} from 'oneentry/dist/products/productsInterfaces';
import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';

import { isError } from '@/app/api';

import { updateUserState } from '../server/users/updateUserState';
import { getApi } from './api';

interface BlockByMarkerProps {
  marker: string;
}

interface BlocksByPageUrlProps {
  pageUrl: string;
}

interface SingleOrderProps {
  marker: string;
  id: number;
  body: IOrderData;
}

/**
 * Redux Toolkit API service for OneEntry CMS
 * @name RTKApi
 *
 * This service provides a centralized API layer for interacting with the OneEntry CMS.
 * It uses Redux Toolkit Query to handle data fetching, caching, and state management.
 * The service includes endpoints for products, pages, blocks, forms, orders, users,
 * accounts, and sessions.
 *
 * NOTE: per-endpoint `keepUnusedDataFor` values are CSR cache lifetimes only.
 * If ISR is enabled later (page-level `export const revalidate`), re-tune these
 * so the client cache doesn't outlive the server-side revalidation window.
 */
export const RTKApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 300, // 5 minutes by default
  tagTypes: [
    'Products',
    'Pages',
    'Blocks',
    'Forms',
    'Orders',
    'User',
    'Accounts',
    'Sessions',
    'Admins',
  ],
  endpoints: (build) => ({
    /**
     * Get all blocks by page URL.
     * Fetches all content blocks associated with a specific page URL.
     * @param pageUrl - URL of the page to get blocks for
     * @returns       Array of position blocks
     */
    getBlocksByPageUrl: build.query<IPositionBlock[], BlocksByPageUrlProps>({
      queryFn: async ({ pageUrl }) => {
        const result = await getApi().Pages.getBlocksByPageUrl(pageUrl);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IPositionBlock[] };
      },
      providesTags: ['Blocks'],
      keepUnusedDataFor: 600, // 10 minutes for blocks
    }),
    /**
     * Get products with filter.
     * Fetches products based on provided filter criteria.
     * @param body - Filter criteria for products
     * @returns    Products response containing products and metadata
     */
    getProducts: build.query<IProductsResponse, { body: IFilterParams[] }>({
      queryFn: async ({ body }) => {
        const result = await getApi().Products.getProducts(body);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IProductsResponse };
      },
      providesTags: ['Products'],
      keepUnusedDataFor: 300, // 5 minutes for products
    }),
    /**
     * Get products by page URL.
     * Fetches products associated with a specific page URL.
     * @param url - URL of the page to get products for
     * @returns   Products response containing products and metadata
     */
    getProductsByPageUrl: build.query<IProductsResponse, { url: string }>({
      queryFn: async ({ url }) => {
        if (!url) {
          return { error: null };
        }
        const result = await getApi().Products.getProductsByPageUrl(url);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IProductsResponse };
      },
      providesTags: ['Products'],
      keepUnusedDataFor: 300, // 5 minutes for products by URL
    }),
    /**
     * Get products by IDs.
     *
     * Uses the SDK's batch endpoint (one request for the whole set) instead of
     * fanning out a request per id; the ids go over as a comma-separated list.
     * @param items - Array of product IDs to fetch
     * @returns     Array of product entities
     */
    getProductsByIds: build.query<IProductsEntity[], { items: number[] }>({
      queryFn: async ({ items }) => {
        /** No ids — nothing to ask the API for. */
        if (items.length < 1) {
          return { data: [] };
        }

        const result = await getApi().Products.getProductsByIds(
          items.join(','),
        );

        if (isError(result)) {
          return { error: result };
        }
        return { data: result };
      },
      providesTags: ['Products'],
      keepUnusedDataFor: 300, // 5 minutes for products by ID
    }),
    /**
     * Get product by ID.
     * Fetches a single product by its ID.
     * @param id - ID of the product to fetch
     * @returns  Product entity
     */
    getProductById: build.query<IProductsEntity, { id: number }>({
      queryFn: async ({ id }) => {
        if (!id) {
          return { error: null };
        }
        const result = await getApi().Products.getProductById(id);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IProductsEntity };
      },
      providesTags: ['Products'],
      keepUnusedDataFor: 300, // 5 minutes for individual product
    }),
    /**
     * Get page by ID.
     * Fetches a single page by its ID.
     * @param id - ID of the page to fetch
     * @returns  Page entity
     */
    getPageById: build.query<IPagesEntity, { id: number }>({
      queryFn: async ({ id }) => {
        if (!id) {
          return { error: null };
        }
        const result = await getApi().Pages.getPageById(id);

        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IPagesEntity };
      },
      providesTags: ['Pages'],
      keepUnusedDataFor: 600, // 10 minutes for pages
    }),
    /**
     * Get block by marker.
     * Fetches a content block by its marker (unique identifier).
     * @param marker - Marker of the block to fetch
     * @returns      Block entity
     */
    getBlockByMarker: build.query<IBlockEntity, BlockByMarkerProps>({
      queryFn: async ({ marker }) => {
        const result = await getApi().Blocks.getBlockByMarker(marker);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IBlockEntity };
      },
      providesTags: ['Blocks'],
      keepUnusedDataFor: 600, // 10 minutes for blocks
    }),
    /**
     * Get all admins (masters).
     * Fetches the full list of admin/master entities. Cached client-side so that
     * components can look up a master by id without each call triggering a new
     * network request.
     * @returns Array of admin entities
     */
    getAdmins: build.query<IAdminEntity[], void>({
      queryFn: async () => {
        const result = await getApi().Admins.getAdminsInfo(
          [],
          undefined,
          0,
          100,
        );
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IAdminEntity[] };
      },
      providesTags: ['Admins'],
      keepUnusedDataFor: 600, // 10 minutes for admins
    }),
    /**
     * Get all authentication providers.
     * Fetches all available authentication providers configured in the system.
     * @returns Array of authentication provider entities
     */
    getAuthProviders: build.query<IAuthProvidersEntity[], string>({
      queryFn: async () => {
        const result = await getApi().AuthProvider.getAuthProviders();
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IAuthProvidersEntity[] };
      },
      keepUnusedDataFor: 3600, // 1 hour for auth providers
    }),
    /**
     * Get form by marker.
     * Fetches a form by its marker (unique identifier).
     * @param marker - Marker of the form to fetch
     * @returns      Form entity
     */
    getFormByMarker: build.query<IFormsEntity, { marker: string }>({
      queryFn: async ({ marker }) => {
        const result = await getApi().Forms.getFormByMarker(marker);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IFormsEntity };
      },
      providesTags: ['Forms'],
      keepUnusedDataFor: 600, // 10 minutes for forms
    }),
    /**
     * Get data of an authorized user.
     * Fetches the profile data of the currently authenticated user.
     * @returns User entity
     */
    getMe: build.query<IUserEntity, void>({
      queryFn: async () => {
        const result = await getApi().Users.getUser();
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IUserEntity };
      },
      providesTags: ['User'],
      keepUnusedDataFor: 60, // 1 minute for user data
    }),
    /**
     * Get all payment accounts.
     * Fetches the payment accounts that are actually usable (visible and in use).
     * @returns Array of account entities
     */
    getAccounts: build.query<IAccountsEntity[], object>({
      queryFn: async () => {
        const result = await getApi().Payments.getAccounts();
        if (isError(result)) {
          return { error: result };
        }
        /** Only accounts enabled in the admin panel may be offered at checkout. */
        return {
          data: (result as IAccountsEntity[]).filter(
            (account) => account.isVisible && account.isUsed,
          ),
        };
      },
      providesTags: ['Accounts'],
      keepUnusedDataFor: 300, // 5 minutes for accounts
    }),
    /**
     * Retrieve order storage object by marker.
     * Fetches an order storage object by its marker (unique identifier).
     * @param marker - Marker of the order object to fetch
     * @returns      Order entity
     */
    getOrderStorageByMarker: build.query<IOrdersEntity, { marker: string }>({
      queryFn: async ({ marker }) => {
        const result = await getApi().Orders.getOrdersStorageByMarker(marker);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IOrdersEntity };
      },
      providesTags: ['Orders'],
      keepUnusedDataFor: 60, // 1 minute for orders
    }),
    /**
     * Get a single payment session by its identifier.
     * Fetches a payment session by its ID.
     * @param id - Identifier of the payment session to fetch
     * @returns  Session entity
     */
    getPaymentSessionById: build.query<ISessionEntity, { id: number }>({
      queryFn: async ({ id }) => {
        const result = await getApi().Payments.getSessionById(id);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as ISessionEntity };
      },
      providesTags: ['Sessions'],
      keepUnusedDataFor: 60, // 1 minute for sessions
    }),
    /**
     * Get a single order from the order storage object created by the user.
     * Fetches a specific order by its ID and the marker of its storage object.
     * @param id     - ID of the order object
     * @param marker - Text identifier of the order storage object
     * @param body   - Additional data for the request
     * @returns      Order by marker entity
     */
    getSingleOrder: build.query<IOrderByMarkerEntity, SingleOrderProps>({
      queryFn: async ({ id, marker }) => {
        const result = await getApi().Orders.getOrderByMarkerAndId(marker, id);
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IOrderByMarkerEntity };
      },
      providesTags: ['Orders'],
      keepUnusedDataFor: 60, // 1 minute for individual orders
    }),
    /**
     * Update a single order from the order storage object created by the user.
     * Updates a specific order by its ID and the marker of its storage object.
     * @param id     - ID of the order object
     * @param marker - Text identifier of the order storage object
     * @param body   - Data to update the order with
     * @returns      Base orders entity
     */
    updateOrderByMarkerAndId: build.query<IBaseOrdersEntity, SingleOrderProps>({
      queryFn: async ({ id, marker, body }) => {
        const result = await getApi().Orders.updateOrderByMarkerAndId(
          marker,
          id,
          body,
        );
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IBaseOrdersEntity };
      },
      providesTags: ['Orders'],
      keepUnusedDataFor: 60, // 1 minute for updated orders
    }),
    /**
     * Update user state — persists cart into `user.state`.
     * Fresh user is fetched inside `updateUserState` to avoid clobbering
     * concurrent state changes (favorites, etc.).
     * @param cart - Cart map to persist
     * @returns    Boolean indicating success or failure
     */
    updateUserState: build.mutation<boolean, { cart: object }>({
      queryFn: async ({ cart }) => {
        const result = await updateUserState({ cart });
        return { data: result };
      },
      invalidatesTags: ['User'],
    }),
    /**
     * Update order.
     * Updates an order with new data.
     * @param id     - ID of the order object
     * @param marker - Text identifier of the order storage object
     * @param body   - Data to update the order with
     * @returns      Base orders entity
     */
    updateOrder: build.mutation<IBaseOrdersEntity, SingleOrderProps>({
      queryFn: async ({ id, marker, body }) => {
        const result = await getApi().Orders.updateOrderByMarkerAndId(
          marker,
          id,
          body,
        );
        if (isError(result)) {
          return { error: result };
        }
        return { data: result as IBaseOrdersEntity };
      },
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useGetBlockByMarkerQuery,
  useGetBlocksByPageUrlQuery,
  useGetFormByMarkerQuery,
  useGetAuthProvidersQuery,
  useLazyGetMeQuery,
  useGetAccountsQuery,
  useGetPageByIdQuery,
  useGetPaymentSessionByIdQuery,
  useLazyGetPaymentSessionByIdQuery,
  useGetOrderStorageByMarkerQuery,
  useGetSingleOrderQuery,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProductsByPageUrlQuery,
  useGetProductsByIdsQuery,
  useUpdateOrderByMarkerAndIdQuery,
  useUpdateUserStateMutation,
  useUpdateOrderMutation,
} = RTKApi;
