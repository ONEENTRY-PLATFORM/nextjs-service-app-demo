'use client';

import Link from 'next/link';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

/**
 * MasterRowData component renders master information in a row.
 * @param   {object}           props                 - Component props
 * @param   {IAttributeValues} props.dict            - Dictionary object with localized strings
 * @param   {IAdminEntity}     props.master          - Master entity object
 * @param   {number}           props.currentId       - Current selected master ID
 * @param   {IPagesEntity}     props.serviceCategory - Service category page entity
 * @returns {JSX.Element}                            MasterRowData.
 */
const MasterRowData = ({
  dict,
  master,
  currentId,
  serviceCategory,
}: {
  dict: IAttributeValues;
  master: IAdminEntity;
  currentId: number;
  serviceCategory: IPagesEntity | undefined;
}): JSX.Element => {
  /**  */
  const { check_profile_text } = dict;
  const { id, attributeValues } = master;
  const { master_name, master_rating, master_short_description } =
    attributeValues;

  const name = (master_name?.value as string | undefined) ?? '';
  const rating = (master_rating?.value as number | undefined) ?? 0;
  const desc = (master_short_description?.value as string | undefined) ?? '';

  /**
   * Ensure consistent value between server and client
   * Handle cases where serviceCategory might be an empty object
   */
  const serviceCategoryName = serviceCategory?.localizeInfos?.title ?? '';
  const formattedServiceCategoryName = serviceCategoryName
    ? `${serviceCategoryName} `
    : '';
  const link = `/masters/${id}?service=${serviceCategory?.id ?? ''}`;
  const defaultChecked = currentId === id;

  /** Master information display component with name, rating and selection option */
  return (
    <div className="mt-3 flex w-[calc(100%-135px)] flex-col justify-start">
      {/** Master header section with name, category and rating */}
      <div className="flex justify-between gap-5">
        <div className="mb-2 flex flex-col">
          <h2 className="text-lg leading-5 text-neutral-600">{name}</h2>
          <p className="mb-1 text-xs font-bold text-fuchsia-500">
            {formattedServiceCategoryName}master
          </p>
          {/** Display master rating with star components */}
          <StarsGroup rating={rating} size={16} />
        </div>
        {/** Radio button for master selection */}
        <input
          className="mt-2 size-4 shrink-0 self-start rounded-full text-fuchsia-500 focus:ring-0"
          type="radio"
          value={id}
          name="masters_group"
          id={`radio-${id}`}
          defaultChecked={defaultChecked}
        />
      </div>
      {/** Master description and profile link section */}
      <div className="mb-3 flex flex-col gap-2.5">
        <div className="text-xs leading-3 text-gray-400">
          {desc.substring(0, 90)}
        </div>
        {/** Link to view complete master profile */}
        <Link
          href={link}
          className="flex text-xs font-bold text-neutral-600 underline hover:text-fuchsia-500 focus:outline-none"
        >
          {check_profile_text?.value as string | undefined}
        </Link>
      </div>
    </div>
  );
};

export default MasterRowData;
