'use client';

import { ArrowUpRight, Scissors } from 'lucide-react';
import Link from 'next/link';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';

/**
 * ProductRow component to display a single product in the search results.
 *
 * This component represents a single product row in the search results dropdown.
 * It provides a link to the product page and adds the product to the cart when clicked.
 * The component uses Redux to manage the cart state and tabs state.
 * @param   {object}                            props          - Component properties
 * @param   {IPagesEntity}                      props.pageData - Page data associated with the product
 * @param   {IProductsEntity}                   props.product  - Product entity to display
 * @param   {Dispatch<SetStateAction<boolean>>} props.setState - Function to update the search results visibility state
 * @returns {JSX.Element}                                      JSX.Element representing a product row in the search results
 */
const ProductRow = ({
  pageData,
  product,
  setState,
}: {
  pageData: IPagesEntity;
  product: IProductsEntity;
  setState: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  /** Get dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /** Handle apply button click to add product to cart and update UI */
  const onApplyHandle = () => {
    /** Hide search results dropdown */
    setState(false);

    /** Add selected product to the shopping cart */
    dispatch(
      addServiceToCart({
        id: activeId,
        productId: product.id,
        serviceId: pageData?.id ?? null,
        salonId: null,
        masterId: null,
      }),
    );

    /** Update tabs state to show products and services tabs */
    dispatch(setTabsState({ key: 'products', value: true }));
    dispatch(setTabsState({ key: 'services', value: true }));
  };

  /* Render product row with link to service page (styled as in the static-html mock) */
  return (
    <Link
      prefetch={false}
      href={`/services/${pageData?.pageUrl || ''}`}
      onClick={() => onApplyHandle()}
      data-testid="search-result-service"
      data-product-id={product.id}
      className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10">
        <Scissors size={15} className="text-fuchsia-500" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-slate-400">
          {product.localizeInfos?.title}
        </span>
        <span className="block truncate text-base text-neutral-300">
          {pageData?.localizeInfos?.title}
        </span>
      </span>
      <ArrowUpRight size={14} className="ml-auto shrink-0 text-neutral-300" />
    </Link>
  );
};

export default ProductRow;
