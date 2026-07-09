import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

/**
 * MasterSingleTitle - component to display a title and a horizontal rule.
 *
 * This component renders a styled title with the word "master" appended to it,
 * along with a decorative horizontal rule below. It uses animation wrapper
 * for enhanced visual presentation.
 * @param   {object}      props       - Component properties
 * @param   {string}      props.title - The title to be displayed (profession/specialization)
 * @returns {JSX.Element}             JSX.Element representing the MasterSingleTitle component
 */
const MasterSingleTitle = ({ title }: { title: string }): JSX.Element => {
  return (
    <TitleAnimations className="relative mx-auto mb-16 box-border flex shrink-0 flex-col max-lg:mb-8 max-sm:mb-6">
      <h1 className="title text-center text-4xl leading-9 font-light text-gray-600 uppercase max-sm:leading-none">
        {title} master
      </h1>
      <hr className="mx-auto mt-5 h-px w-full max-w-37.5 self-center border-solid border-gray-600" />
    </TitleAnimations>
  );
};

export default MasterSingleTitle;
