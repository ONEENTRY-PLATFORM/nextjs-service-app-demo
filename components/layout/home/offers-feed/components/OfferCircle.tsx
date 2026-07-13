import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import StarLgIcon from '@/components/icons/star-lg';

/**
 * OfferCircle component displays the circular promotional element with offer details
 * @param   {object}           props             - Component properties
 * @param   {object}           props.item        - Offer data containing titles and icon information
 * @param   {string}           props.item.title1 - First title text
 * @param   {string}           props.item.title2 - Second title text
 * @param   {boolean}          props.item.icon   - Icon flag
 * @param   {IAttributeValues} props.dict        - Dictionary of attribute values
 * @returns {JSX.Element}                        React component representing the circular offer display
 */
const OfferCircle = ({
  item,
}: {
  item: {
    title1: string;
    title2: string;
    icon: boolean;
  };
  dict: IAttributeValues;
}): JSX.Element => {
  /** Destructure title1, title2, and icon properties from item */
  const { title1, title2, icon } = item;

  /** Render offer circle with titles and optional star icon */
  return (
    <div className="-mt-24 mb-5 size-65 justify-center rounded-full bg-gray-700 px-10 pt-32 pb-10 text-xl leading-8 transition-transform duration-500 group-hover:scale-110">
      <span className="text-xl whitespace-nowrap">{title1}</span> +{' '}
      <span className="text-xl whitespace-nowrap">{title2}</span>
      {/* Conditionally render star icon based on icon flag */}
      {icon && <StarLgIcon />}
    </div>
  );
};

export default OfferCircle;
