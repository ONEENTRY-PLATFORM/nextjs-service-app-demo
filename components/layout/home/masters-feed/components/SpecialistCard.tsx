import Image from 'next/image';
import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import type { MasterItem } from '@/components/layout/masters-page/taxonomy';

/**
 * SpecialistCard — one tile of the home "OUR SPECIALISTS" strip: the master's
 * photo under a purple gradient overlay with name, role and a "Check a profile"
 * link, tiling to the master's profile (static-html mock, `HomePage.tsx` → OUR
 * SPECIALISTS).
 *
 * The {@link CardAnimations} wrapper gives the tile the same behaviour as the
 * catalog and offer cards: it fades and scales in once it scrolls into view,
 * reverses back out when it leaves, and scales away on page transitions —
 * staggered by `index` so the strip cascades.
 * @param   {object}      props        - Component properties
 * @param   {MasterItem}  props.master - Normalized specialist to display
 * @param   {number}      props.index  - Index in the strip, for staggered animations
 * @returns {JSX.Element}              Animated specialist tile
 */
const SpecialistCard = ({
  master,
  index,
}: {
  master: MasterItem;
  index: number;
}): JSX.Element => {
  /** UI-text dictionary (system_content) with English fallbacks */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  return (
    <CardAnimations className="w-full" index={index}>
      <Link
        data-testid="master-card"
        data-master-id={master.id}
        prefetch={false}
        href={master.href ?? '/masters'}
        className="group relative block overflow-hidden rounded-[15px] bg-slate-100 text-left shadow-[0_10px_30px_rgba(124,42,232,0.18)]"
        style={{ aspectRatio: '3/4' }}
      >
        {master.photo && (
          <Image
            src={master.photo}
            alt={master.name}
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
            placeholder={master.photoBlur ? 'blur' : 'empty'}
            {...(master.photoBlur ? { blurDataURL: master.photoBlur } : {})}
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
            {master.name}
          </p>
          <p className="text-[14px] leading-tight font-bold whitespace-nowrap text-white/90">
            {master.role}
          </p>
          <span className="mt-1 inline-block w-fit text-[14px] font-semibold whitespace-nowrap text-white underline underline-offset-[3px] transition-opacity group-hover:opacity-80">
            {(dict?.check_a_profile_text?.value as string | undefined) ||
              'Check a profile'}
          </span>
        </div>
      </Link>
    </CardAnimations>
  );
};

export default SpecialistCard;
