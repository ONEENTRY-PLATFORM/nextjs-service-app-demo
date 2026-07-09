import Image from 'next/image';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

/**
 * MastersCardImage component displays the image for a master's card in the gallery
 * @param   {object}       props        - Component properties
 * @param   {IAdminEntity} props.master - Master entity containing image and name data
 * @returns {JSX.Element}               Image component with master's photo or default placeholder
 */
const MastersCardImage = ({
  master,
}: {
  master: IAdminEntity;
}): JSX.Element => {
  const { attributeValues } = master;
  /** Extract image and name attributes from master's attribute values */
  const { master_image, master_name } = attributeValues || {};
  /** Determine image source from preview or download link */
  const imgArr = master_image?.value as
    | Array<{
        previewLink?: { default: string[] };
        downloadLink?: { default: string[] };
      }>
    | undefined;
  const imageSrc = imgArr?.[0]?.previewLink || imgArr?.[0]?.downloadLink;
  /** Set name with fallback to default placeholder */
  const name = (master_name?.value as string | undefined) || '...';

  if (!imageSrc) return <></>;

  return (
    <Image
      width={480}
      height={640}
      src={imageSrc.default[1]!}
      alt={name}
      loading="lazy"
      // placeholder="blur"
      // blurDataURL={}
      className="gallery-card-img relative h-80 w-full object-cover duration-500 group-hover:scale-125 group-hover:transition-transform"
    />
  );
};

export default MastersCardImage;
