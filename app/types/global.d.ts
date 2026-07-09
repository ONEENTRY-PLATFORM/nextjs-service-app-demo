import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IFilterParams } from 'oneentry/dist/products/productsInterfaces';

declare type LocalizeInfo = {
  content: string;
  menuTitle: string;
  title: string;
};

declare type PageProps = Promise<{
  params: { page: string; handle: string };
  searchParams?: {
    search?: string;
    page?: string;
    filters?: IFilterParams[];
  };
}>;

declare type SimplePageProps = {
  page?: IPagesEntity;
  dict: IAttributeValues;
};

declare type LoaderProps = {
  data?: Record<string, unknown>;
  limit?: number;
  offset?: number;
};

declare type MetadataParams = {
  params: { handle: string };
};

export type CartState = {
  quantity: number;
  id: number;
};

export type AnimationsProps = {
  children: ReactNode;
  className: string;
  index: number;
};

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

declare type IAppOrder = {
  formIdentifier?: string;
  paymentAccountIdentifier?: string;
  formData: Array<IOrdersFormData & { valid?: boolean }>;
  products: Array<IOrderProductData>;
};
