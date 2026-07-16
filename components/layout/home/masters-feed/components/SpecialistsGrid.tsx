import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';

import type { MasterItem } from '@/components/layout/masters-page/taxonomy';

/**
 * SpecialistsGrid — the "OUR SPECIALISTS" strip ported from the static-html
 * mock (`HomePage.tsx` → OUR SPECIALISTS): full-width edge-to-edge tiles with a
 * purple gradient overlay, name, role and a "Check a profile" link. Renders the
 * same normalized {@link MasterItem} shape whether it comes from CMS admins
 * (each tile links to `/masters/{id}`) or the demo roster (linking to the
 * specialists page).
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
      {masters.map((spec) => (
        <Link
          key={spec.id}
          data-testid="master-card"
          data-master-id={spec.id}
          prefetch={false}
          href={spec.href ?? '/masters'}
          className="group relative block overflow-hidden rounded-[15px] bg-slate-100 text-left shadow-[0_10px_30px_rgba(124,42,232,0.18)]"
          style={{ aspectRatio: '3/4' }}
        >
          {spec.photo && (
            <Image
              src={spec.photo}
              alt={spec.name}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              placeholder={spec.photoBlur ? 'blur' : 'empty'}
              {...(spec.photoBlur ? { blurDataURL: spec.photoBlur } : {})}
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          )}
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

export default SpecialistsGrid;
