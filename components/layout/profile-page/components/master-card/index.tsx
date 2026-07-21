'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

import CardAnimations from '../../animations/CardAnimations';

/**
 * MasterCard component displays a master's profile card with image, name, service type and rating.
 * When `masterId` is set, the card links to the specialist profile page.
 * @param   {object}           props                 - Component properties
 * @param   {IAttributeValues} props.attributeValues - Master's attribute values including image, name and rating
 * @param   {number}           [props.masterId]      - CMS admin id of the master, used to build the profile link
 * @returns {JSX.Element}                            A card component displaying master's information
 */
const MasterCard = ({
  attributeValues,
  masterId,
}: {
  attributeValues: IAttributeValues;
  masterId?: number | undefined;
}): JSX.Element => {
  /** Extract master's image source, name, role and rating from attribute values */
  const imgArr = attributeValues?.master_image?.value as
    Array<{ downloadLink: string }> | undefined;
  const imgSrc = imgArr?.[0]?.downloadLink;
  const masterName = attributeValues?.master_name?.value as string | undefined;
  const masterRole =
    (attributeValues?.master_short_description?.value as string | undefined) ||
    'Specialist';
  const masterRating =
    (attributeValues?.master_rating?.value as number | undefined) ?? 0;

  /** Card body — shared between the linked and the static (unknown master) variants. */
  const inner = (
    <>
      {imgSrc && (
        <div
          className="self-center overflow-hidden rounded-2xl"
          style={{ border: '2px solid #ed21f122' }}
        >
          <Image
            width={160}
            height={180}
            loading="lazy"
            src={imgSrc}
            className="aspect-card w-40 object-cover"
            alt={'Profile image of ' + masterName}
          />
        </div>
      )}
      <h3 className="mt-4 text-base leading-tight font-semibold text-slate-400">
        {masterName}
      </h3>
      <p className="mt-0.5 text-sm text-neutral-300">{masterRole}</p>
      {/* Display master's rating using star icons */}
      <div className="mt-1 mb-2">
        {/* Profile visit card uses PINK stars (static-html AccountPage) */}
        <StarsGroup rating={masterRating} size={16} color="#ed21f1" />
      </div>
    </>
  );

  return (
    <CardAnimations className="flex w-40 flex-col self-stretch" index={0}>
      {masterId ? (
        <Link
          prefetch={false}
          href={'/masters/' + masterId}
          title={masterName}
          className="flex flex-col transition-transform duration-300 hover:-translate-y-1"
          data-testid="profile-master-card-link"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
    </CardAnimations>
  );
};

export default MasterCard;
