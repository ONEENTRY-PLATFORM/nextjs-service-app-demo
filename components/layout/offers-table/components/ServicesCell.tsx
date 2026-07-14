import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX, Key } from 'react';

/**
 * ServicesCell component displays services associated with a product in a table cell
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity containing service information
 * @param   {string}          props.color   - Color for the plus sign indicator
 * @returns {JSX.Element}                   JSX element representing services in a table cell
 */
const ServicesCell = ({
  product,
  color,
}: {
  product: IProductsEntity;
  color: string;
}): JSX.Element => {
  /** Extract services from product attributes (`offer_services` entity list) */
  const services = product.attributeValues?.offer_services?.value as
    Array<{ title: string }> | undefined;

  return (
    <div className="relative box-border flex shrink-0 flex-row items-center">
      {/* Plus sign indicator colored as specified */}
      <div className={'mr-1.5 aspect-square w-2'} style={{ color: color }}>
        +
      </div>
      {/** Services list */}
      <div className="flex flex-col text-lg">
        {services?.map((s, i: Key) => {
          return (
            <div
              key={i}
              className="leading-6 text-neutral-600 group-hover:text-fuchsia-500"
            >
              {s.title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesCell;
