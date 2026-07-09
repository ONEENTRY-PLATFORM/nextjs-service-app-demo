import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';

import OfferCircle from './OfferCircle';
import OfferInfo from './OfferInfo';

/**
 * OfferCard component displays a single offer in the offers feed
 * @param   {object}           props                      - Component properties
 * @param   {IAttributeValues} props.dict                 - Dictionary containing localized texts
 * @param   {object}           props.item                 - Offer data including titles, background image, discount info and product
 * @param   {string}           props.item.title1          - First title text
 * @param   {string}           props.item.title2          - Second title text
 * @param   {string}           props.item.backgroundImage - Background image URL
 * @param   {string}           props.item.priceOff        - Price off/discount information
 * @param   {string}           props.item.icon            - Icon identifier
 * @param   {IProductsEntity}  props.item.product         - Product associated with the offer
 * @param   {number}           props.index                - Index of the card for animation purposes
 * @returns {JSX.Element}                                 React component representing an offer card with animation
 */
const OfferCard = ({
  dict,
  item,
  index,
}: {
  dict: IAttributeValues;
  item: {
    title1: string;
    title2: string;
    backgroundImage: string;
    priceOff: number;
    icon: boolean;
    product: IProductsEntity;
  };
  index: number;
}): JSX.Element => {
  /** Extract background image from item */
  const { backgroundImage } = item;

  /** Render offer card with background image, circle and info components */
  return (
    <CardAnimations
      style={{
        backgroundImage: backgroundImage,
      }}
      className="group flex h-full w-3/12 max-w-55 min-w-50 flex-col justify-center rounded-card text-center font-bold text-white uppercase max-lg:w-[48%]"
      index={index}
    >
      <div className="mx-auto flex h-auto w-full grow-0 flex-col items-center overflow-hidden rounded-card pb-8">
        <OfferCircle item={item} dict={dict} />
        <OfferInfo item={item} dict={dict} />
      </div>
    </CardAnimations>
  );
};

export default OfferCard;
