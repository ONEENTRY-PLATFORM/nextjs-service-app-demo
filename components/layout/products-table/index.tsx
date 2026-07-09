'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';

import TableAnimations from './animations/TableAnimations';
import ProductRow from './components/ProductRow';
import SectionTitle from './components/SectionTitle';

/**
 * ProductsTable component
 * @param   {object}            props          - component props
 * @param   {string}            props.title    - title of the section
 * @param   {IProductsEntity[]} props.products - products to display
 * @param   {IPagesEntity}      props.service  - service page
 * @returns {JSX.Element}                      JSX.Element
 */
const ProductsTable = ({
  title,
  products,
  service,
}: {
  products: IProductsEntity[];
  title: string;
  service: IPagesEntity;
}): JSX.Element => {
  /** Get router instance for navigation */
  const router = useTransitionRouter();
  /** Get dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Define border color for the table */
  const color = 'fuchsia-500';
  /** Filter out service set products from the products list */
  const filteredProducts = products.filter(
    (product) => product.attributeSetIdentifier !== 'service_set',
  );

  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /**
   * Handle click event
   * @param {IProductsEntity} product - product entity
   */
  const clickHandle = (product: IProductsEntity) => {
    /** Add selected product to the cart */
    dispatch(
      addServiceToCart({
        id: activeId,
        productId: product.id,
        serviceId: service.id,
        salonId: null,
        masterId: null,
      }),
    );
    /** Update products tab state to active */
    dispatch(setTabsState({ key: 'products', value: true }));
    /** Update services tab state to active */
    dispatch(setTabsState({ key: 'services', value: true }));
    /** Navigate to booking page */
    router.push('/booking');
  };

  /** Render products table with title and animated container */
  return (
    <section className="relative box-border flex shrink-0 flex-col">
      <SectionTitle title={title} />
      <TableAnimations
        className={
          'rounded-xl px-9 max-sm:px-4 py-5 max-md:max-w-full border border-solid border-' +
          color
        }
      >
        {filteredProducts.length > 0 && (
          <table className="w-full">
            <tbody>
              {filteredProducts.map((product, index) => (
                <ProductRow
                  key={index}
                  product={product}
                  color={color}
                  index={index}
                  clickHandle={clickHandle}
                  isLast={filteredProducts.length === index + 1}
                />
              ))}
            </tbody>
          </table>
        )}
      </TableAnimations>
    </section>
  );
};

export default ProductsTable;
