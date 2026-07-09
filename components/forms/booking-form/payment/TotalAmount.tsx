import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import useCartItem from '@/app/store/useCartItem';
import { UsePrice } from '@/components/utils';

/**
 * Total amount price of all products in cart.
 * @param   {object}           props      - component props.
 * @param   {IAttributeValues} props.dict - dictionary from server api.
 * @returns {JSX.Element}                 JSX.Element.
 */
const TotalAmount = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  /** Hydrate the active cart row so we can read the current product's price */
  const { product } = useCartItem();

  /** salePrice === oldPrice */
  const salePrice = product?.attributeValues?.sale?.value as number | undefined;
  const total = product?.price || salePrice;

  /** Get localized title for total amount */
  const title =
    (dict?.order_info_total?.value as string | undefined) || 'Total';

  /** Render total amount with formatted price */
  return (
    <div className="mb-5 flex w-full flex-col gap-2.5 self-start leading-[94%]">
      <div className="relative box-border flex w-full shrink-0 flex-row justify-between self-stretch font-medium text-neutral-600">
        <span>{title}: </span>
        <span>
          <UsePrice amount={total || 0} />
        </span>
      </div>
    </div>
  );
};

export default TotalAmount;
