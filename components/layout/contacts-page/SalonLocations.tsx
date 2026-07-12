'use client';

import type { JSX, UIEvent } from 'react';
import { useState } from 'react';

import SectionHeading from '@/components/shared/SectionHeading';

import SalonCard from './SalonCard';
import type { ContactSalon } from './types';

export type { ContactSalon };

/**
 * SalonLocations component — the "Our Locations" section of the contacts page
 * as in the static-html mock (`ContactsPage.tsx`): section heading, location
 * cards ({@link SalonCard}; stacked on mobile, a horizontal snap row on tablet,
 * a 3-column grid on desktop) and the scroll dots shown only where the row
 * scrolls.
 * @param   {object}         props        - Component properties
 * @param   {ContactSalon[]} props.salons - Salons to render
 * @returns {JSX.Element}                 Locations section
 */
const SalonLocations = ({
  salons,
}: {
  salons: ContactSalon[];
}): JSX.Element => {
  /** Index of the card closest to the scroll position — drives the dots */
  const [activeLoc, setActiveLoc] = useState(0);

  const onLocScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const kids = el.children;
    let closest = 0;
    let min = Infinity;
    for (let i = 0; i < kids.length; i++) {
      const kid = kids[i];
      if (!(kid instanceof HTMLElement)) continue;
      const d = Math.abs(kid.offsetLeft - el.scrollLeft);
      if (d < min) {
        min = d;
        closest = i;
      }
    }
    setActiveLoc(closest);
  };

  return (
    <section
      className="pt-6 pb-2 md:pt-10 md:pb-6"
      style={{ background: 'linear-gradient(180deg,#f7f7fb 0%,#fff 60%)' }}
    >
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="mb-6 text-center md:mb-10">
          <SectionHeading size="lg">Our Locations</SectionHeading>
        </div>

        {salons.length === 0 ? (
          <p className="py-8 text-center text-base text-neutral-300">
            No salon locations available at the moment.
          </p>
        ) : (
          <>
            <div
              onScroll={onLocScroll}
              className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:max-xl:-mx-8 md:max-xl:flex md:max-xl:snap-x md:max-xl:overflow-x-auto md:max-xl:px-8 md:max-xl:[&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {salons.map((salon, i) => (
                <SalonCard key={salon.id} salon={salon} idx={i} />
              ))}
            </div>

            {/* Scroll dots — tablet only (where the cards scroll horizontally) */}
            <div className="mt-5 hidden items-center justify-center gap-1.5 md:max-xl:flex">
              {salons.map((salon, i) => (
                <span
                  key={salon.id}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: activeLoc === i ? 18 : 6,
                    height: 6,
                    background: activeLoc === i ? salon.color : '#d4d5e1',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SalonLocations;
