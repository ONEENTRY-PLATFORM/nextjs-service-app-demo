import Link from 'next/link';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import StarsGroup from '@/components/shared/StarsGroup';

import SpecialistImage from './SpecialistImage';

/**
 * SpecialistCard component displays information about a specialist/master
 * @param   {object}                                       props                        - Component properties
 * @param   {IAdminEntity}                                 props.item                   - Admin entity representing the specialist
 * @param   {number}                                       props.index                  - Index of the card for animation purposes
 * @param   {{id: string, title: string, pageUrl: string}} props.specialization         - Specialization information including id, title and page URL
 * @param   {string}                                       props.specialization.id      - Id of the specialization
 * @param   {string}                                       props.specialization.title   - Title of the specialization
 * @param   {string}                                       props.specialization.pageUrl - Page URL of the specialization
 * @returns {Promise<JSX.Element>}                                                      Promise resolving to a JSX element representing a specialist card
 */
const SpecialistCard = async ({
  item,
  index,
  specialization,
}: {
  item: IAdminEntity;
  index: number;
  specialization: {
    id: string;
    title: string;
    pageUrl: string;
  };
}): Promise<JSX.Element> => {
  /** Get dictionary for localization */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Extract check profile text from dictionary */
  const { check_profile_text } = dict;
  /** Destructure id and attribute values from item */
  const { id, attributeValues } = item;
  /** Extract master name and rating attributes */
  const { master_name, master_rating } = attributeValues;
  /** Extract master's name with fallback to empty string */
  const title = (master_name?.value as string | undefined) || '';
  /** Create specialization text */
  const spec = specialization.title + ' master';
  /** Extract master's rating */
  const rating = master_rating?.value as number | undefined;
  /** Construct link to master's profile with selected service */
  const link = '/masters/' + id + '?service=' + specialization.id;

  /** Render specialist card with image, name, specialization, rating and profile link */
  return (
    <CardAnimations className="group relative w-60" index={index}>
      {/** Display specialist image */}
      <SpecialistImage item={item} />
      <div className="flex items-center justify-between gap-2 px-3 py-4">
        <div className="my-auto flex flex-col justify-between gap-2">
          {/** Display master name */}
          <h3 className="text-base leading-4 text-nowrap text-neutral-600">
            {title}
          </h3>
          {/** Display specialization */}
          <p className="justify-center text-xs font-bold text-fuchsia-500">
            {spec}
          </p>
        </div>
        <div className="relative box-border flex shrink-0 flex-col gap-2.5 text-right">
          {/** Display star rating */}
          <StarsGroup rating={Number(rating)} size={14} />
          {/** Display profile link */}
          <Link
            href={link}
            className="self-end text-xs font-bold text-neutral-600 underline group-hover:text-fuchsia-500 focus:outline-none"
          >
            {check_profile_text?.value as string | undefined}
          </Link>
        </div>
        {/* Invisible full-size link to make entire card clickable */}
        <Link
          href={link}
          className="absolute top-0 left-0 size-full focus:outline-none"
          title={title}
        ></Link>
      </div>
    </CardAnimations>
  );
};

export default SpecialistCard;
