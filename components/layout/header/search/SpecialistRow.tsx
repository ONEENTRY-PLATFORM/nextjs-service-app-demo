'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';

import Image from '@/components/shared/Image';
import { fileBlurDataUrl } from '@/components/utils/fileBlurDataUrl';
import { fileDisplayUrl } from '@/components/utils/fileDisplayUrl';

import { adminAttr } from './adminAttr';

/**
 * Single specialist row in the search popup — photo, name, role and an
 * arrow, as in the static-html mock.
 * @param   {object}                            props         - Component properties
 * @param   {IAdminEntity}                      props.admin   - Admin (master) entity to display
 * @param   {Dispatch<SetStateAction<boolean>>} props.setOpen - Popup visibility setter
 * @returns {JSX.Element}                                     Specialist row
 */
const SpecialistRow = ({
  admin,
  setOpen,
}: {
  admin: IAdminEntity;
  setOpen: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  const name = adminAttr(admin, 'master_name');
  const role = adminAttr(admin, 'master_short_description');
  const photo = fileDisplayUrl(admin.attributeValues?.master_image?.value);
  /** Ready-made CMS LQIP — the avatar loads behind a blur instead of popping in */
  const photoBlur = fileBlurDataUrl(admin.attributeValues?.master_image?.value);

  return (
    <Link
      prefetch={false}
      href={`/masters/${admin.id}`}
      onClick={() => setOpen(false)}
      className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      <Image
        src={photo}
        sizes="36px"
        alt={name}
        placeholder={photoBlur ? 'blur' : 'empty'}
        {...(photoBlur ? { blurDataURL: photoBlur } : {})}
        className="size-9 shrink-0 rounded-full"
        imageClassName="object-top"
      />
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-slate-400">
          {name}
        </span>
        <span className="block truncate text-base text-fuchsia-500">
          {role}
        </span>
      </span>
      <ArrowUpRight size={14} className="ml-auto shrink-0 text-neutral-300" />
    </Link>
  );
};

export default SpecialistRow;
