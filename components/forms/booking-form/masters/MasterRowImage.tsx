'use client';

import Image from 'next/image';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

/**
 * MasterRowImage component renders the image for a master row.
 * @param   {object}       props        - Component props.
 * @param   {IAdminEntity} props.master - IAdminEntity.
 * @returns {JSX.Element}               MasterRowImage.
 */
const MasterRowImage = ({ master }: { master: IAdminEntity }): JSX.Element => {
  /** Extract attribute values from master data */
  const { attributeValues } = master;

  /** Destructure master name and image from attribute values */
  const { master_name, master_image } = attributeValues;

  /** Fallback to '...' if master name is not available */
  const name = (master_name?.value as string | undefined) ?? '...';

  /** Get image source from preview or download link */
  const imageArr = master_image?.value as
    | Array<{
        previewLink?: { default: string[] };
        downloadLink?: { default: string[] };
      }>
    | undefined;
  const imageSrc = imageArr?.[0]?.previewLink || imageArr?.[0]?.downloadLink;

  /** Render master image or placeholder if image is not available */
  return (
    <div className="relative flex h-full min-h-40 w-33.75">
      {imageSrc ? (
        <Image
          height={160}
          width={135}
          sizes="(min-width: 480px) 50vw, 100vw"
          src={imageSrc.default[1]!}
          className="h-full min-h-full w-33.75 rounded-2xl object-cover"
          alt={name}
        />
      ) : (
        /** Placeholder to ensure consistent rendering between server and client */
        <div
          className="flex h-full min-h-full w-33.75 items-center justify-center rounded-2xl bg-gray-200"
          style={{ height: 160, width: 135 }}
        >
          <span className="text-xs text-gray-500">No image</span>
        </div>
      )}
    </div>
  );
};

export default MasterRowImage;
