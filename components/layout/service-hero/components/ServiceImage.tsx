import Image from 'next/image';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

/**
 * ServiceImage component renders the background image for a service page
 * @param   {object}       props      - Component props
 * @param   {IPagesEntity} props.page - The page entity containing attribute values including background image
 * @returns {JSX.Element}             JSX element with the background image or empty element if no image available
 */
const ServiceImage = ({ page }: { page: IPagesEntity }): JSX.Element => {
  /** Extract background image and localized information from page attributes */
  const { service_hero_bg } = page.attributeValues;
  const bgArr = service_hero_bg?.value as
    Array<{ downloadLink?: string }> | undefined;
  const heroImage = bgArr?.[0]?.downloadLink;
  const alt = page.localizeInfos?.title || '...';

  /** If no hero image is available, return empty fragment */
  if (!heroImage) {
    return <></>;
  }

  return (
    <div className="bg-wrapper absolute inset-0 size-full bg-gradient-1">
      <Image
        fill
        src={heroImage}
        sizes="(min-width: 1200px) 50vw, 100vw"
        fetchPriority="high"
        className="hero-bg inset-0 mx-auto size-full max-w-500 object-cover"
        alt={alt}
      />
    </div>
  );
};

export default ServiceImage;
