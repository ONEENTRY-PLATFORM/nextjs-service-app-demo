'use client';

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

  /* Render product row with link to service page */
  return (
    <Link
      prefetch={false}
      href={`/services/${pageData?.pageUrl || ''}`}
      onClick={() => onApplyHandle()}
      className="flex w-full py-2 hover:text-fuchsia-500"
    >
      {product.localizeInfos?.title}
    </Link>
  );
};

export default ProductRow;
