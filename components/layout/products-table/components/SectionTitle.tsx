import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

/**
 * SectionTitle component for displaying section titles with animation effects
 * @param   {object}      props       - Component properties object
 * @param   {string}      props.title - The title text to display
 * @returns {JSX.Element}             Returns a JSX element containing the title and decorative line
 */
const SectionTitle = ({ title }: { title: string }): JSX.Element => (
  <TitleAnimations className="relative mx-auto mb-6 box-border flex w-fit shrink-0 flex-col max-lg:mb-6 max-sm:mb-5">
    <h1 className="title self-center px-3 text-center text-[clamp(1.2rem,2.4vw,1.65rem)] font-light tracking-fine text-ink uppercase">
      {title}
    </h1>
    <hr className="mt-2 h-px w-full shrink-0 self-center border-b border-solid border-b-slate-400" />
  </TitleAnimations>
);

export default SectionTitle;
