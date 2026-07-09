import Image from 'next/image';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import StarsGroup from '@/components/shared/StarsGroup';

/**
 * SpecialistCardH component displays a horizontal card with specialist information.
 * Shows specialist image, name, specialization, and rating.
 * @param   {object}       props      - Component props
 * @param   {IAdminEntity} props.item - Admin entity containing specialist information
 * @returns {JSX.Element}             JSX element representing the SpecialistCardH component
 */
const SpecialistCardH = ({ item }: { item: IAdminEntity }): JSX.Element => {
  /** Extract attribute values from the admin entity */
  const { attributeValues } = item;

  /** Destructure specific attributes from attributeValues */
  const { master_image, master_name, specialization, master_rating } =
    attributeValues;

  /** Extract and format the master data */
  const title = (master_name?.value as string | undefined) || '...';
  /** Specialization title */
  const specArr = specialization?.value as Array<{ title: string }> | undefined;
  const spec = specArr?.[0]?.title;
  /** Rating value */
  const rating = (master_rating?.value as number | undefined) ?? 0;
  /** Master's image URL */
  const imgArr = master_image?.value as
    Array<{ downloadLink: string }> | undefined;
  const imageSrc = imgArr?.[0]?.downloadLink ?? '';

  return (
    /** Container for the specialist card with horizontal layout */
    <div className="flex grow-0 gap-5">
      {/* Image container */}
      <figure className="flex">
        <Image
          width={200}
          height={240}
          src={imageSrc}
          className="h-30 w-25 rounded-2xl object-cover"
          alt={title}
        />
      </figure>

      {/* Text content container */}
      <div className="flex w-auto grow flex-col text-base leading-8">
        {/* Master's name */}
        <h2 className="text-lg leading-6 text-slate-400">{title}</h2>

        {/* Specialization */}
        <p className="mb-2.5 text-xs leading-3 font-bold text-fuchsia-500">
          {spec}
        </p>

        {/* Rating stars component */}
        <StarsGroup rating={rating} size={20} />
      </div>
    </div>
  );
};

export default SpecialistCardH;
