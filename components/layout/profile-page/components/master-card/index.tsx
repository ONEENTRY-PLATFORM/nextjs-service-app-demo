'use client';

import Image from 'next/image';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

import CardAnimations from '../../animations/CardAnimations';

/**
 * MasterCard component displays a master's profile card with image, name, service type and rating
 * @param   {object}           props                 - Component properties
 * @param   {IAttributeValues} props.attributeValues - Master's attribute values including image, name and rating
 * @returns {JSX.Element}                            A card component displaying master's information
 */
const MasterCard = ({
  attributeValues,
}: {
  attributeValues: IAttributeValues;
}): JSX.Element => {
  /** Extract master's image source, name and rating from attribute values */
  const imgArr = attributeValues?.master_image?.value as
    Array<{ downloadLink: string }> | undefined;
  const imgSrc = imgArr?.[0]?.downloadLink;
  const masterName = attributeValues?.master_name?.value as string | undefined;
  const masterRating =
    (attributeValues?.master_rating?.value as number | undefined) ?? 0;

  return (
    <CardAnimations className="flex flex-col self-stretch" index={0}>
      {imgSrc && (
        <Image
          width={160}
          height={180}
          loading="lazy"
          src={imgSrc}
          className="aspect-card w-40 self-center rounded-2xl object-cover"
          alt={'Profile image of ' + masterName}
        />
      )}
      <h3 className="mt-4 text-xl leading-4 font-medium text-fuchsia-500">
        {masterName}
      </h3>
      <p className="mt-1 text-xs leading-8 font-bold text-neutral-600">
        {masterName} haircut
      </p>
      {/* Display master's rating using star icons */}
      <div className="mb-2">
        <StarsGroup rating={masterRating} size={16} />
      </div>
    </CardAnimations>
  );
};

export default MasterCard;
