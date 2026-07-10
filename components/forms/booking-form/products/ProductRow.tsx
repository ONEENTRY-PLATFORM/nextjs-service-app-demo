'use client';

import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

/**
 * ProductRow component renders a single product row in the booking form.
 * @param   {object}                             props                  - component props.
 * @param   {number}                             props.currentId        - current product id.
 * @param   {IProductsEntity}                    props.product          - product data.
 * @param   {(product: IProductsEntity) => void} props.addProductToCart - function to add product to cart.
 * @param   {number}                             props.index            - product index.
 * @returns {JSX.Element}                                               ProductRow.
 */
const ProductRow = ({
  currentId,
  product,
  addProductToCart,
}: {
  currentId: number;
  product: IProductsEntity;
  index: number;
  addProductToCart: (product: IProductsEntity) => void;
}): JSX.Element => {
  /** Destructure product properties */
  const { price, attributeValues, attributeSetIdentifier, localizeInfos, id } =
    product;

  /** Get sale price from attribute values */
  const salePrice = attributeValues?.sale?.value as number | undefined;

  /** Determine title based on whether it's a service set or not */
  const services = attributeValues.services?.value as
    { title: string }[] | undefined;
  const title =
    attributeSetIdentifier === 'offer'
      ? services?.map((p) => p.title).join(' + ')
      : localizeInfos?.title;

  /** Determine button text color class */
  const isCurrentProduct = currentId === id;
  const textColorClass = isCurrentProduct ? 'text-fuchsia-500' : '';

  /** Determine price text decoration class */
  const priceTextClass = salePrice
    ? 'text-xs line-through leading-7'
    : 'text-gray-400';

  /* Render product row with title and price information */
  return (
    <div className="dropdown-item flex border-b border-b-slate-250">
      <button
        onClick={() => addProductToCart(product)}
        className={`flex w-full justify-between py-2 hover:text-fuchsia-500 focus:text-fuchsia-500 ${textColorClass}`}
      >
        <span className="text-left">{title}</span>
        <span className="flex flex-row gap-3 self-stretch">
          {salePrice && (
            <div className={`whitespace-nowrap ${priceTextClass}`}>
              {salePrice} $
            </div>
          )}
          <div className="whitespace-nowrap">{price} $</div>
        </span>
      </button>
    </div>
  );
};

export default ProductRow;
