import type { JSX } from 'react';

import type { MasterItem } from '@/components/layout/masters-page/taxonomy';

import SpecialistCard from './SpecialistCard';

/**
 * SpecialistsGrid — the "OUR SPECIALISTS" strip ported from the static-html
 * mock (`HomePage.tsx` → OUR SPECIALISTS): full-width edge-to-edge tiles
 * (2 columns on mobile, 3 on tablet, 6 on desktop). Renders the same normalized
 * {@link MasterItem} shape whether it comes from CMS admins (each tile links to
 * `/masters/{id}`) or the demo roster; each {@link SpecialistCard} carries its
 * own scroll and page-transition animations.
 * @param   {object}       props         - Component properties
 * @param   {MasterItem[]} props.masters - Specialists to display (already trimmed to the strip length)
 * @returns {JSX.Element}                Specialists grid
 */
const SpecialistsGrid = ({
  masters,
}: {
  masters: MasterItem[];
}): JSX.Element => {
  return (
    <div
      data-testid="specialists-strip"
      className="mt-4 grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 md:mt-10 md:gap-4 md:px-6 lg:grid-cols-6"
    >
      {masters.map((spec, index) => (
        <SpecialistCard key={spec.id} master={spec} index={index} />
      ))}
    </div>
  );
};

export default SpecialistsGrid;
