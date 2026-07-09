'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import DropdownAnimations from './animations/DropdownAnimations';
import DropdownButton from './DropdownButton';
import ProductsList from './products/ProductsList';

/**
 * Products Component.
 * @param   {object}           props        - Component properties.
 * @param   {IAttributeValues} props.dict   - dictionary from server api.
 * @param   {IPagesEntity[]}   props.salons - salons from server api.
 * @returns {JSX.Element}                   JSX.Element.
 */
const Products = ({
  dict,
  salons,
}: {
  dict: IAttributeValues;
  salons: IPagesEntity[];
}): JSX.Element => {
  const tabKey = 'products';

  /** Safely extract text value with optional chaining and provide a default */
  const selectServiceText =
    (dict.select_product?.value as string | undefined) || 'Select Product';

  /** Render products dropdown with animations and product list */
  return (
    <DropdownAnimations
      id={tabKey}
      className="mb-4 flex w-full flex-col items-center"
      index={2}
      tabKey={tabKey}
    >
      <DropdownButton title={selectServiceText} tabKey={tabKey} />
      <ProductsList tabKey={tabKey} salons={salons} />
    </DropdownAnimations>
  );
};

export default Products;
