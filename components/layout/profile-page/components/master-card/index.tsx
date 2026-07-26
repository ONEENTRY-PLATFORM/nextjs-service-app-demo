'use client';

import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import Image from '@/components/shared/Image';
import StarsGroup from '@/components/shared/StarsGroup';
import { fileBlurDataUrl } from '@/components/utils/fileBlurDataUrl';
import { fileDisplayUrl } from '@/components/utils/fileDisplayUrl';

import VisitCardAnimations from '../../animations/VisitCardAnimations';

/**
 * MasterCard component displays a master's profile card with image, name, service type and rating.
 * When `masterId` is set, the card links to the specialist profile page.
 * @param   {object}           props                 - Component properties
 * @param   {IAttributeValues} props.attributeValues - Master's attribute values including image, name and rating
 * @param   {number}           [props.masterId]      - CMS admin id of the master, used to build the profile link
 * @param   {number}           [props.index]         - Card index inside the history section, for the animation stagger
 * @returns {JSX.Element}                            A card component displaying master's information
 */
const MasterCard = ({
  attributeValues,
  masterId,
  index = 0,
}: {
  attributeValues: IAttributeValues;
  masterId?: number | undefined;
  index?: number | undefined;
}): JSX.Element => {
  const dict = useDict();

  /** Extract master's image source, name, role and rating from attribute values */
  const imgSrc = fileDisplayUrl(attributeValues?.master_image?.value);
  /** Ready-made CMS LQIP (`previewLink`) shown while the portrait downloads */
  const imgBlur = fileBlurDataUrl(attributeValues?.master_image?.value);
  const masterName = attributeValues?.master_name?.value as string | undefined;
  const masterRole =
    (attributeValues?.master_short_description?.value as string | undefined) ||
    (dict?.specialist_text?.value as string | undefined) ||
    'Specialist';
  const masterRating =
    (attributeValues?.master_rating?.value as number | undefined) ?? 0;

  /** Card body — shared between the linked and the static (unknown master) variants. */
  const inner = (
    <>
      <div
        className="self-center overflow-hidden rounded-2xl"
        style={{ border: '2px solid #ed21f122' }}
      >
        <Image
          sizes="160px"
          loading="lazy"
          src={imgSrc}
          placeholder={imgBlur ? 'blur' : 'empty'}
          {...(imgBlur ? { blurDataURL: imgBlur } : {})}
          className="aspect-card w-40"
          alt={'Profile image of ' + masterName}
        />
      </div>
      <h3 className="mt-4 text-base leading-tight font-semibold text-slate-400">
        {masterName}
      </h3>
      <p className="mt-0.5 text-sm text-neutral-300">{masterRole}</p>
      {/* Display master's rating using star icons */}
      <div className="mt-1 mb-2">
        {/* Profile visit card uses PINK stars */}
        <StarsGroup rating={masterRating} size={16} color="#ed21f1" />
      </div>
    </>
  );

  return (
    <VisitCardAnimations
      className="flex w-40 flex-col self-stretch"
      index={index}
    >
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
    </VisitCardAnimations>
  );
};

export default MasterCard;
