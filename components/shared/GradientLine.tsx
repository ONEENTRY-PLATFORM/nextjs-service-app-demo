import type { JSX } from 'react';

import LineAnimations from '@/app/animations/LineAnimations';

/**
 * Gradient line component
 *
 * This component renders a gradient line with animation effects.
 * It uses the LineAnimations component to provide visual effects
 * and applies a gradient background by default.
 * @param   {object}               props           - Component properties
 * @param   {string}               props.className - CSS classes to apply to the line element
 * @returns {Promise<JSX.Element>}                 Gradient line with animations
 */
const GradientLine = async ({
  className = 'h-12.5 sm:h-15 lg:h-20 xl:h-22.5 2xl:h-25',
}: {
  className?: string;
}): Promise<JSX.Element> => {
  return (
    <LineAnimations
      className={'bg-gradient-1 ' + className}
      delay={0}
    ></LineAnimations>
  );
};

export default GradientLine;
