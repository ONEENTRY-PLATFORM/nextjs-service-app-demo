import Link from 'next/link';
import type { JSX } from 'react';

import type { MasterItem } from '@/components/layout/masters-page/taxonomy';

/**
 * SpecialistsDemoGrid — the "OUR SPECIALISTS" strip rendered from the demo
 * roster (`getLocalMasters`) while the CMS holds no masters (content plan,
 * stage 4). Full-width edge-to-edge tiles with a purple gradient overlay, name,
 * role and a "Check a profile" link, mirroring the static-html mock. Every tile
 * links to the specialists page — demo masters have no individual profile.
 * @param   {object}       props         - Component properties
 * @param   {MasterItem[]} props.masters - Demo specialists to display (already trimmed to the strip length)
 * @returns {JSX.Element}                Specialists grid
 */
const SpecialistsDemoGrid = ({
  masters,
}: {
  masters: MasterItem[];
}): JSX.Element => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 md:mt-10 md:gap-4 md:px-6 lg:grid-cols-6">
      {masters.map((spec) => (
        <Link
          key={spec.id}
          href="/masters"
          className="group relative block overflow-hidden rounded-[15px] text-left shadow-[0_10px_30px_rgba(124,42,232,0.18)]"
          style={{ aspectRatio: '3/4' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spec.photo}
            alt={spec.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          {/* Purple gradient overlay */}
          <div
            className="absolute inset-x-0 bottom-0 h-[62%]"
            style={{
              background:
                'linear-gradient(to top, rgba(124,42,232,0.96) 0%, rgba(150,52,224,0.78) 32%, rgba(170,70,224,0.32) 62%, rgba(170,70,224,0) 100%)',
            }}
          />
          {/* Name & role */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 px-4 pb-4">
            <p className="text-[18px] leading-tight font-semibold whitespace-nowrap text-white">
              {spec.name}
            </p>
            <p className="text-[14px] leading-tight font-bold whitespace-nowrap text-white/90">
              {spec.role}
            </p>
            <span className="mt-1 inline-block w-fit text-[14px] font-semibold whitespace-nowrap text-white underline underline-offset-[3px] transition-opacity group-hover:opacity-80">
              Check a profile
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SpecialistsDemoGrid;
