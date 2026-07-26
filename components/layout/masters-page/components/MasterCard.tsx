'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import Image from '@/components/shared/Image';
import { dictText } from '@/components/utils/dictText';

import type { MasterItem } from '../taxonomy';

/**
 * MasterCard — a specialist photo card: a 238×320 portrait with a purple
 * gradient fading up from the bottom and the name / role / "Check a profile"
 * meta overlaid in white.
 *
 * Renders as a link to the specialist profile when `item.href` is set (CMS
 * admins); local demo specialists render as a static card — profile pages
 * exist only for CMS admins.
 * @param   {object}      props      - Component properties
 * @param   {MasterItem}  props.item - Normalized specialist item
 * @returns {JSX.Element}            Specialist photo card
 */
const MasterCard = ({ item }: { item: MasterItem }): JSX.Element => {
  const dict = useDict();
  const className =
    'group relative block h-80 w-59.5 shrink-0 overflow-hidden rounded-[15px] bg-accent-purple text-left transition-transform duration-300 hover:-translate-y-1';
  const style = { boxShadow: '0 10px 30px rgba(124,42,232,0.18)' };

  const inner = (
    <>
      {/* Portrait — the shared Image paints the brand placeholder when the
          CMS photo is missing or fails to load */}
      <Image
        sizes="238px"
        src={item.photo}
        alt={item.name}
        loading="lazy"
        placeholder={item.photoBlur ? 'blur' : 'empty'}
        {...(item.photoBlur ? { blurDataURL: item.photoBlur } : {})}
        className="absolute inset-0"
        imageClassName="object-top transition-transform duration-500 group-hover:scale-105"
      />

      {/* Purple gradient overlay fading up from the bottom (mock values) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[62%]"
        style={{
          background:
            'linear-gradient(to top, rgba(124,42,232,0.96) 0%, rgba(150,52,224,0.78) 32%, rgba(170,70,224,0.32) 62%, rgba(170,70,224,0) 100%)',
        }}
      />

      {/* Overlaid meta */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 px-5 pb-5">
        <p className="text-[21px] leading-tight font-semibold whitespace-nowrap text-white">
          {item.name}
        </p>
        <p className="text-[13px] leading-tight font-bold whitespace-nowrap text-white/90">
          {item.role}
        </p>
        <span className="mt-1.5 inline-block w-fit text-sm font-semibold whitespace-nowrap text-white underline decoration-white/90 underline-offset-3 transition-opacity group-hover:opacity-80">
          {dictText(dict, 'check_a_profile_text', 'Check a profile')}
        </span>
      </div>
    </>
  );

  return item.href ? (
    <Link
      prefetch={false}
      href={item.href}
      title={item.name}
      className={className}
      style={style}
      data-testid="master-card"
      data-master-id={item.id}
    >
      {inner}
    </Link>
  ) : (
    <div
      className={className}
      style={style}
      data-testid="master-card"
      data-master-id={item.id}
    >
      {inner}
    </div>
  );
};

export default MasterCard;
