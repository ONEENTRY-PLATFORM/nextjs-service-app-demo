'use client';

import { ArrowUpRight, UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';

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
  const photoArr = admin.attributeValues?.master_image?.value as
    Array<{ downloadLink?: string }> | undefined;
  const photo = photoArr?.[0]?.downloadLink;

  return (
    <Link
      prefetch={false}
      href={`/masters/${admin.id}`}
      onClick={() => setOpen(false)}
      className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      {photo ? (
        <Image
          src={photo}
          width={36}
          height={36}
          alt={name}
          className="size-9 shrink-0 rounded-full object-cover object-top"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10">
          <UserCircle size={18} className="text-fuchsia-500" />
        </span>
      )}
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
