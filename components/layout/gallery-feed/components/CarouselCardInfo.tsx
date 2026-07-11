import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

/**
 * CarouselCardInfo component to display information about a carousel gallery item.
 *
 * This component shows the master's name, their specialization, and a link to their profile.
 * It uses localized text for the "Check Profile" link and is designed to be displayed
 * at the bottom of a carousel gallery card.
 * @param   {object}           props                     - Component properties
 * @param   {IAttributeValues} props.dict                - Dictionary object containing localized text values
 * @param   {object}           props.cardData            - Object containing master and specialization information
 * @param   {string}           props.cardData.name       - Name of the master
 * @param   {string}           props.cardData.link       - Link to the master's profile page
 * @param   {object}           props.cardData.spec       - Specialization information with title
 * @param   {string}           props.cardData.spec.title - Specialization title
 * @returns {JSX.Element}                                JSX.Element representing the card information section
 */
const CarouselCardInfo = ({
  dict,
  cardData: { name, link, spec },
}: {
  dict: IAttributeValues;
  cardData: {
    name: string;
    link: string;
    spec: {
      title: string;
    };
  };
}): JSX.Element => {
  /** Get the localized "Check Profile" text or use default */
  const checkProfileText =
    (dict?.check_profile_text?.value as string | undefined) || 'Check Profile';

  /** Render carousel card information with master name, specialization and profile link */
  return (
    <div className="gallery-card-content flex size-full flex-col gap-1 px-8 py-6 max-sm:px-5">
      {/** Display master name */}
      <div className="text-xl leading-5 max-md:text-lg max-sm:text-base">
        {name}
      </div>
      {/** Display specialization title */}
      <div className="text-sm leading-4 font-bold max-sm:text-xs">
        {spec?.title}
      </div>
      {/** Render link to master profile only when a master is linked */}
      {link && (
        <Link
          href={link}
          className="text-sm underline hover:text-fuchsia-500 focus:outline-none max-sm:text-xs"
        >
          {checkProfileText}
        </Link>
      )}
    </div>
  );
};

export default CarouselCardInfo;
