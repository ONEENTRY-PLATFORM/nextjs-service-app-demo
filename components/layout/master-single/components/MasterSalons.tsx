import type { JSX } from 'react';

import LocationIcon from '@/components/icons/location';

/**
 * MasterSalons component to display a list of salons.
 *
 * This component renders a list of salons where a master works,
 * displaying each salon with a location icon.
 * @param   {object}                     props              - Component properties
 * @param   {{value: {title: string}[]}} props.salons       - An object containing an array of salon objects with titles
 * @param   {Array<{title: string}>}     props.salons.value - An array of salon objects with titles
 * @returns {JSX.Element}                                   JSX.Element representing the MasterSalons component or null if no salons provided
 */
const MasterSalons = ({
  salons,
}: {
  salons: {
    value: {
      title: string;
    }[];
  };
}): JSX.Element => {
  /** Return empty fragment if salons data is not provided */
  if (!salons) {
    return <></>;
  }

  /** Render list of salons where master works */
  return (
    <>
      {salons.value.map((salon, index) => (
        <address key={index} className="flex gap-3.5 not-italic max-sm:gap-2.5">
          <LocationIcon size={5} />
          <span className="my-auto flex-auto leading-5 text-gray-700">
            {salon.title}
          </span>
        </address>
      ))}
    </>
  );
};

export default MasterSalons;
