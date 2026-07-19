import type { JSX } from 'react';

import SectionHeading from '@/components/shared/SectionHeading';

/**
 * Home section title — a thin wrapper over the shared {@link SectionHeading} so
 * the home page sections use the exact same heading (typography, underline draw
 * and fade entrance) as every other section across the site. It only adapts the
 * call shape: a `title` string instead of children.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.title       - Heading text (rendered uppercase)
 * @param   {number}      [props.delay]     - GSAP entrance delay (seconds)
 * @param   {string}      [props.className] - Extra classes for the wrapper (e.g. bottom margin)
 * @returns {JSX.Element}                   Animated section title
 */
const SectionTitle = ({
  title,
  delay = 0,
  className = '',
}: {
  title: string;
  delay?: number;
  className?: string;
}): JSX.Element => (
  <SectionHeading delay={delay} className={className}>
    {title}
  </SectionHeading>
);

export default SectionTitle;
