import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';
import { useMemo } from 'react';

import { useGetProductsByPageUrlQuery, useGetProductsQuery } from '@/app/api/';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
} from '@/app/store/reducers/CartSlice';
import useCartItem from '@/app/store/useCartItem';
import type { TabKey } from '@/app/types/global';

import NotFound from '../NotFound';
import ProductRow from './ProductRow';

/**
 * ProductsList component renders a list of products for booking.
 * @param   {object}         props        - props.
 * @param   {string}         props.tabKey - tabKey.
 * @param   {IPagesEntity[]} props.salons - salons.
 * @returns {JSX.Element}                 ProductsList.
 */
const ProductsList = ({
  salons,
}: {
  tabKey: TabKey;
  salons: IPagesEntity[];
}): JSX.Element => {
  const dispatch = useAppDispatch();

  const activeId = useAppSelector(selectActiveItemId);
  /** Hydrated entities for the active cart row */
  const {
    salon: currentSalon,
    service: currentService,
    master: currentMaster,
    product: currentProduct,
  } = useCartItem();

  const { data } = useGetProductsByPageUrlQuery({
    url: currentService?.pageUrl || '',
  });
  const { data: allProducts } = useGetProductsQuery({ body: [] });

  /** filter products */
  const filteredProducts = useMemo(() => {
    const productsData = data?.items || allProducts?.items;
    if (!productsData) return [];
    /**
     * Linked service/product references stored in attributeValues.
     * Product refs carry a composite string id `p-<parentId>-<productId>`,
     * plain services a numeric id.
     */
    type LinkedRef = { id: number | string; parentId: number };
    const masterServices = currentMaster?.attributeValues?.services?.value as
      LinkedRef[] | undefined;
    const inMastersProducts = masterServices
      ?.filter((m): m is LinkedRef & { id: string } => typeof m.id === 'string')
      .map((m) => Number(m.id.replace('p-' + m.parentId + '-', '')));

    return productsData.filter((product) => {
      /** check if product in salon */
      const inSalon = salons.some((salon) => {
        if (salon.id === currentSalon?.id || currentSalon?.id === undefined) {
          const salonProducts = salon.attributeValues?.products?.value as
            LinkedRef[] | undefined;
          return salonProducts
            ?.map((m) =>
              typeof m.id === 'string'
                ? Number(m.id.replace('p-' + m.parentId + '-', ''))
                : m.id,
            )
            .some((pId) => pId === product.id);
        }
        return false;
      });

      /** check if product in Master */
      const inMaster =
        inMastersProducts && inMastersProducts.length > 0
          ? inMastersProducts.some((pId) => pId === product.id)
          : true;

      return inSalon && inMaster;
    });
  }, [data, allProducts, currentSalon, currentMaster, salons]);

  /**
   * Add service to cart
   * @param {IProductsEntity} product - Service to add to cart
   */
  const addProductToCart = (product: IProductsEntity) => {
    dispatch(
      addServiceToCart({
        id: activeId,
        productId: product.id,
      }),
    );
  };

  /** render ProductsList */
  return (
    <ul className="dropdown-container flex w-full flex-col overflow-hidden rounded-3xl bg-white px-4 text-center text-sm leading-7 text-neutral-600">
      {filteredProducts?.length > 0 ? (
        filteredProducts.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            currentId={currentProduct?.id ?? -1}
            index={index}
            addProductToCart={addProductToCart}
          />
        ))
      ) : (
        <div className="flex w-full flex-col overflow-hidden rounded-3xl bg-white px-4 text-center text-sm leading-7 text-neutral-600">
          <NotFound message="Products not found" />
        </div>
      )}
    </ul>
  );
};

export default ProductsList;
