import Image from 'next/image';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

/**
 * BookingCardImage component renders the image for the booking card.
 * @param   {object}       props        - Component props
 * @param   {IAdminEntity} props.master - master
 * @returns {JSX.Element}               JSX.Element
 */
const BookingCardImage = ({
  master,
}: {
  master: IAdminEntity;
}): JSX.Element => {
  /** Get image source from preview or download link */
  const imageArr = master.attributeValues?.master_image?.value as
    | Array<{
        previewLink?: { default: string[] };
        downloadLink?: { default: string[] };
      }>
    | undefined;
  const imageSrc = imageArr?.[0]?.previewLink || imageArr?.[0]?.downloadLink;

  /** Get master name with fallback to '...' */
  const masterName =
    (master.attributeValues?.master_name?.value as string | undefined) || '...';

  /** Render master image in a figure container */
  return (
    <figure className="relative mb-4 flex h-40 w-full flex-col items-center justify-center self-start overflow-hidden rounded-2xl">
      {imageSrc && (
        <Image
          fill
          sizes="(min-width: 600px) 50vw, 100vw"
          loading="lazy"
          src={imageSrc.default[1]!}
          className="size-full object-cover"
          alt={masterName}
        />
      )}
    </figure>
  );
};

export default BookingCardImage;
