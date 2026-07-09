import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

/**
 * SectionTitle component displays a styled section title with animation and colored styling
 * @param   {object}      props       - Component properties
 * @param   {string}      props.title - Text content for the title
 * @param   {string}      props.color - Color for the title text and underline
 * @returns {JSX.Element}             JSX element representing an animated section title
 */
const SectionTitle = ({
  title,
  color,
}: {
  title: string;
  color: string;
}): JSX.Element => {
  return (
    <TitleAnimations
      className={
        'mx-auto mb-6 box-border flex shrink-0 flex-col max-lg:mb-6 max-sm:mb-5'
      }
    >
      {/** Title */}
      <h2
        className={'title self-center text-4xl font-light uppercase'}
        style={{ color: color }}
      >
        {title}
      </h2>
      {/* Underline with the same color as the title */}
      <hr
        className="mx-auto mt-5 h-px w-full max-w-37.5 shrink-0 self-center border-solid border-slate-500"
        style={{ borderColor: color }}
      />
    </TitleAnimations>
  );
};

export default SectionTitle;
