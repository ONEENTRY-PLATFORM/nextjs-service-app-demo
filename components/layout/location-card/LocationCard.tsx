import Image from 'next/image';
import Link from 'next/link';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import { defaultSalonPhoto, salonPhotosData } from '@/components/data';
import LocationIcon from '@/components/icons/location';
import PhoneIcon from '@/components/icons/phone';

/** Fallback photo when the location name is not recognized. */
const DEFAULT_PHOTO: string = defaultSalonPhoto;

/** Salon location photos (mock data in `components/data.js`) by location name. */
const LOCATION_PHOTOS: Record<string, string> = salonPhotosData;

/**
 * LocationCard component displays information about a salon location.
 * Shows details like title, address, and phone number with appropriate icons.
 * @param   {object}       props       - Component props
 * @param   {IPagesEntity} props.page  - Page entity containing location information
 * @param   {number}       props.index - Index for animation purposes
 * @returns {JSX.Element}              JSX element representing the LocationCard component
 */
const LocationCard = ({
  page,
  index,
}: {
  page: IPagesEntity;
  index: number;
}): JSX.Element => {
  /** Destructure localizeInfos and attributeValues from the page entity */
  const { localizeInfos, attributeValues } = page;

  /** Safely extract values with fallbacks */
  const title = localizeInfos?.title ?? 'Location';
  /** Get salon address with fallback to default text */
  const address =
    (attributeValues?.salon_address?.value as string | undefined) ??
    'Address not available';
  /** Get phone number with fallback to empty string */
  const phone =
    (attributeValues?.salon_phone?.value as string | undefined) ?? '';
  /** Get formatted phone number or use raw phone number as fallback */
  const phoneFormatted =
    (attributeValues?.salon_phone_formatted?.value as string | undefined) ??
    phone;
  /** Pick a salon photo by location name, defaulting to the flagship studio */
  const photoKey = Object.keys(LOCATION_PHOTOS).find((key) =>
    String(title).toLowerCase().includes(key),
  );
  const photo = (photoKey && LOCATION_PHOTOS[photoKey]) || DEFAULT_PHOTO;

  /** Render location card with title, address, phone and map */
  return (
    <CardAnimations className="flex gap-5 self-stretch" index={index}>
      <div className="flex grow flex-col max-md:mt-10 max-md:max-w-full">
        <div className="flex w-full flex-col justify-center">
          {/* Title */}
          <h2 className="mb-4 text-base leading-6 font-bold text-fuchsia-500">
            {title}
          </h2>
          <div className="flex flex-col text-neutral-600 not-italic">
            {/* Address */}
            <address className="mb-2 flex gap-1.5 text-sm leading-3 not-italic">
              <LocationIcon size={20} />
              <span>{address}</span>
            </address>
            {/* Phone */}
            {phone && (
              <Link
                href={`tel:${phone}`}
                className="mt-2.5 mb-2 flex gap-1 text-sm leading-3 font-bold"
              >
                <PhoneIcon />
                <span>{phoneFormatted}</span>
              </Link>
            )}
          </div>
        </div>
        {/* Salon photo */}
        <div className="relative mt-6 h-36 w-full">
          <Image
            fill
            loading="lazy"
            src={photo}
            sizes="(min-width: 480px) 50vw, 100vw"
            className="aspect-[2.63] w-full rounded-2xl object-cover"
            alt={`${title} location`}
          />
        </div>
      </div>
    </CardAnimations>
  );
};

export default LocationCard;
