'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';
import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';

import TableAnimations from '../products-table/animations/TableAnimations';
import OfferRow from './components/OfferRow';
import SectionTitle from './components/SectionTitle';

/**
 * OffersTable component displays special offers grouped by color/type in separate table sections
 * @param   {object}            props          - Component properties
 * @param   {IProductsEntity[]} props.products - Array of product entities representing special offers
 * @param   {IPagesEntity}      props.service  - Service page entity associated with these offers
 * @returns {JSX.Element[]}                    Array of JSX elements representing offer table sections
 */
const OffersTable = ({
  products,
  service,
}: {
  products: IProductsEntity[];
  service: IPagesEntity;
}): JSX.Element[] => {
  const router = useTransitionRouter();
  const dispatch = useAppDispatch();
  const title = 'SPECIAL OFFERS';

  /** Filter products to only include service set items */
  const offersData = useMemo(() => {
    if (!products) {
      return [];
    }
    return products.filter(
      (product) => product.attributeSetIdentifier === 'offer',
    );
  }, [products]);

  /** Extract unique colors from offer types for grouping offers */
  const tableColors = [
    ...new Set(
      offersData?.map((product: IProductsEntity) => {
        const arr = product.attributeValues?.offer_type?.value as
          Array<{ extended?: { value: string } }> | undefined;
        return arr?.[0]?.extended?.value;
      }),
    ),
  ].filter((c): c is string => typeof c === 'string');

  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /**
   * Handle click on an offer - add product and service to cart and navigate to booking
   * @param   {IProductsEntity} product - The selected product/offer
   * @returns {void}
   */
  const handleClick = (product: IProductsEntity) => {
    /** Add the selected service and product to the cart */
    dispatch(
      addServiceToCart({
        id: activeId,
        productId: product.id,
        serviceId: service.id,
        salonId: null,
        masterId: null,
      }),
    );
    /** Update tabs state to show products and services */
    dispatch(setTabsState({ key: 'products', value: true }));
    dispatch(setTabsState({ key: 'services', value: true }));
    /** Navigate to booking page */
    router.push('/booking');
  };

  return (
    tableColors.map((color: string, idx: number) => {
      /** Filter offers by color/type */
      const offers = offersData?.filter((offer: IProductsEntity) => {
        const arr = offer.attributeValues?.offer_type?.value as
          Array<{ extended?: { value: string } }> | undefined;
        if (arr?.[0]?.extended?.value === color) {
          return offer;
        }
        return;
      });
      return (
        <section
          key={color + idx}
          className="relative box-border flex shrink-0 flex-col"
        >
          {/** Section title */}
          <SectionTitle title={title} color={color} />

          {/** Table wrapper */}
          <TableAnimations
            className={
              'rounded-xl border border-solid px-9 py-5 max-md:max-w-full max-sm:px-5'
            }
            style={{ borderColor: color }}
          >
            <table className="w-full">
              <tbody>
                {offers.map((product: IProductsEntity, index: number) => {
                  return (
                    <OfferRow
                      key={index}
                      index={index}
                      product={product}
                      color={color}
                      handleClick={handleClick}
                      isLast={offers.length === index + 1}
                    />
                  );
                })}
              </tbody>
            </table>
          </TableAnimations>
        </section>
      );
    }) || <></>
  );
};

export default OffersTable;
