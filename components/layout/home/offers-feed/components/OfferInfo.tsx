'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import { useGetPageByIdQuery } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';

/**
 * OfferInfo component displays offer details and handles offer selection
 * @param   {object}           props               - Component properties
 * @param   {object}           props.item          - Offer data containing discount percentage and product information
 * @param   {number}           props.item.priceOff - Discount percentage
 * @param   {IProductsEntity}  props.item.product  - Product information
 * @param   {IAttributeValues} props.dict          - Dictionary containing localized texts
 * @returns {JSX.Element}                          React component with offer information and selection button
 */
const OfferInfo = ({
  item,
  dict,
}: {
  item: {
    priceOff: number;
    product: IProductsEntity;
  };
  dict: IAttributeValues;
}): JSX.Element => {
  /** Get router instance for navigation */
  const router = useTransitionRouter();
  /** Get dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /** Fetch service data based on product's service parent ID (`offer_services`) */
  const servicesArr = item.product.attributeValues.offer_services?.value as
    Array<{ value?: { parentId?: number } }> | undefined;
  const serviceParentId = servicesArr?.[0]?.value?.parentId ?? 0;
  const { data: service } = useGetPageByIdQuery(
    { id: serviceParentId },
    { skip: !serviceParentId },
  );

  /**
   * Function to add service to cart and navigate to booking page
   * @param   {IProductsEntity} product - The product to add to cart
   * @returns {void}
   */
  const handleSelect = (product: IProductsEntity) => {
    /** Don't proceed if service data is not available */
    if (!service) {
      return;
    }
    /** Add the selected service to the cart */
    dispatch(
      addServiceToCart({
        id: activeId,
        serviceId: service.id,
        productId: product.id,
        salonId: null,
        masterId: null,
        date: null,
      }),
    );
    /** Update tabs state to show services and products */
    dispatch(setTabsState({ key: 'services', value: true }));
    dispatch(setTabsState({ key: 'products', value: true }));
    /** Navigate to booking page */
    router.push('/booking');
  };

  /* Render offer information with discount percentage and select button */
  return (
    <div className="flex flex-col px-3.5">
      <p className="mb-5 text-6xl max-md:text-4xl">-{item.priceOff} %</p>
      <button
        onClick={() => handleSelect(item.product)}
        className="w-full rounded-md bg-white px-3.5 py-1.5 text-center text-base leading-5 tracking-[3px] text-zinc-800 uppercase transition-colors duration-300 hover:text-zinc-900 hover:shadow-md focus:outline-none"
      >
        {(dict.select_txt?.value as string | undefined) || 'Select'}
      </button>
    </div>
  );
};

export default OfferInfo;
