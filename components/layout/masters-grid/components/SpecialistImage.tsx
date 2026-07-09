import Image from 'next/image';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import getLqipPreview from '@/components/hooks/getLqipPreview';

/**
 * SpecialistImage component displays a specialist's image with blur placeholder
 * @param   {object}               props      - Component properties
 * @param   {IAdminEntity}         props.item - Admin entity containing specialist's image and name data
 * @returns {Promise<JSX.Element>}            Promise resolving to a JSX element with the specialist's image
 */
const SpecialistImage = async ({
  item,
}: {
  item: IAdminEntity;
}): Promise<JSX.Element> => {
  /** Extract image and name from specialist's attributes */
  const { master_image, master_name } = item.attributeValues;
  /** Set name with fallback to default placeholder */
  const title = (master_name?.value as string | undefined) || '...';
  /** Determine image source from preview or download link */
  const imgArr = master_image?.value as
    | Array<{
        previewLink?: { default: string[] };
        downloadLink?: { default: string[] };
      }>
    | undefined;
  const imgSrc = imgArr?.[0]?.previewLink || imgArr?.[0]?.downloadLink;

  return (
    <figure className="relative flex h-70 w-full flex-col overflow-hidden rounded-2xl">
      {imgSrc && (
        <Image
          fill
          sizes="(min-width: 600px) 50vw, 100vw"
          src={imgSrc.default[1]!}
          alt={title}
          loading="lazy"
          placeholder="blur"
          /** Generate low quality image placeholder for blur effect */
          blurDataURL={(await getLqipPreview(imgSrc.default[0]!)) || ''}
          className="aspect-card size-full object-cover transition-transform duration-500 group-hover:scale-125"
        />
      )}
    </figure>
  );
};

export default SpecialistImage;
