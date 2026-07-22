import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type {
  IOrderProductData,
  IOrdersFormData,
} from 'oneentry/dist/orders/ordersInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IFilterParams } from 'oneentry/dist/products/productsInterfaces';
import type { ReactNode } from 'react';

/**
 * Shared prop and payload shapes.
 *
 * This was a `.d.ts` and named four types it never imported (`IAttributeValues`,
 * `IOrdersFormData`, `IOrderProductData`, `ReactNode`). Inside a declaration
 * file `skipLibCheck: true` swallows the resulting TS2304, so those names
 * silently degraded to the error type — which is why `SimplePageProps.dict`,
 * `FormProps.dict` and `IAppOrder` behaved as `any` in a codebase that has no
 * other `any`. As a normal module the compiler checks it like everything else,
 * and the `@/app/types/global` import path is unchanged for every consumer.
 */

/** Route props of a paginated, filterable listing page. */
export type PageProps = Promise<{
  params: { page: string; handle: string };
  searchParams?: {
    search?: string;
    page?: string;
    filters?: IFilterParams[];
  };
}>;

/** Props of a page body that receives its CMS page and the UI dictionary. */
export type SimplePageProps = {
  page?: IPagesEntity;
  dict: IAttributeValues;
};

/** Props of a skeleton placeholder rendered while a list loads. */
export type LoaderProps = {
  data?: Record<string, unknown>;
  limit?: number;
  offset?: number;
};

/** Params of a `generateMetadata` on a `[handle]` route. */
export type MetadataParams = {
  params: { handle: string };
};

/** A cart line: how many of which product. */
export type CartState = {
  quantity: number;
  id: number;
};

/** Props shared by the index-driven animation wrappers. */
export type AnimationsProps = {
  children: ReactNode;
  className: string;
  index: number;
};

/** Props of a CMS-backed form: the UI dictionary plus layout classes. */
export type FormProps = { dict: IAttributeValues; className: string };

/** Define the type for tab keys */
export type TabKey =
  | 'salons'
  | 'services'
  | 'products'
  | 'masters'
  | 'calendar'
  | 'signin'
  | 'payment';

/** An order as the app assembles it before posting it to the CMS. */
export type IAppOrder = {
  formIdentifier?: string;
  paymentAccountIdentifier?: string;
  formData: Array<IOrdersFormData & { valid?: boolean }>;
  products: Array<IOrderProductData>;
};
