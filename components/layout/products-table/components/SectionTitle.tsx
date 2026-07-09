import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

/**
 * SectionTitle component for displaying section titles with animation effects
 * @param   {object}      props       - Component properties object
 * @param   {string}      props.title - The title text to display
 * @returns {JSX.Element}             Returns a JSX element containing the title and decorative line
 */
const SectionTitle = ({ title }: { title: string }): JSX.Element => (
  <TitleAnimations className="relative mx-auto mb-6 box-border flex shrink-0 flex-col max-lg:mb-6 max-sm:mb-5">
    <h1 className="title self-center text-4xl font-light text-slate-600 uppercase">
      {title}
    </h1>
    <hr className="mx-auto mt-5 h-px w-full max-w-37.5 shrink-0 self-center border-solid border-slate-500" />
  </TitleAnimations>
);

export default SectionTitle;
